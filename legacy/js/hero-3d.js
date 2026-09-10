import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

// ─── CINEMATIC RED NOISE BACKGROUND SHADER ────────────────────────────────────
const NOISE_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const NOISE_FRAG = `
uniform float uTime;
uniform vec2  uRes;
varying vec2  vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
}
float fbm(vec2 p) {
  float v=0.0, a=0.5;
  for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; }
  return v;
}
void main() {
  vec2 q = vUv * 2.5;
  float n  = fbm(q + uTime * 0.04);
  float n2 = fbm(q + n   + uTime * 0.022);
  float col= fbm(q + n2);

  // Pure black → deep charcoal → dark blood red
  vec3 dark   = vec3(0.008, 0.003, 0.003);  // near-absolute black
  vec3 mid    = vec3(0.038, 0.008, 0.008);  // very dark red-black
  vec3 accent = vec3(0.140, 0.018, 0.018);  // deep blood red

  vec3 color = mix(dark, mid, col * 0.8);
  color = mix(color, accent, smoothstep(0.42, 0.78, n2) * 0.55);

  // Strong radial vignette — darkest at edges, slight lift at portrait position (right of center)
  vec2 uv2 = vUv - vec2(0.62, 0.5);
  float vig = 1.0 - smoothstep(0.0, 0.75, dot(uv2, uv2) * 2.6);
  color *= (0.55 + 0.45 * vig);

  // Subtle red halo where the portrait will live
  vec2 halo = vUv - vec2(0.65, 0.52);
  float h = 1.0 - smoothstep(0.0, 0.32, dot(halo, halo) * 6.0);
  color += vec3(0.06, 0.0, 0.0) * h;

  gl_FragColor = vec4(color, 1.0);
}`;

// ─── HERO 3D SCENE ────────────────────────────────────────────────────────────
class Hero3DScene {
    constructor() {
        this.canvas = document.getElementById('hero-3d-canvas');
        if (!this.canvas) return;

        // State
        this.clock        = new THREE.Clock();
        this.mouse        = new THREE.Vector2();
        this.targetMouse  = new THREE.Vector2();
        this.isActive     = true;

        // Portrait 3D objects
        this.portraitGroup = null;
        this.portraitMesh  = null;
        this.glowMesh      = null;

        // Externally driven values (set by window.heroPortrait API)
        this._targetX      = 0;
        this._targetRY     = 0;
        this._targetGlow   = 0.55;
        this._currentX     = 0;
        this._currentRY    = 0;
        this._currentGlow  = 0.55;
        this._targetScale  = 1;

        this.setupRenderer();
        this.setupScenes();
        this.createNoiseBg();
        this.createParticles();
        this.createLights();
        // this.loadPortrait(); // Disabled to use standard 2D portrait for scroll reveal
        this.bindEvents();
        this.exposeAPI();

        window.addEventListener('sectionChange', (e) => {
            this.isActive = (e.detail.id === 'home' || e.detail.id === 'about');
        });

        this.animate();
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: false,
            antialias: true,
            powerPreference: 'high-performance',
        });
        this.renderer.setPixelRatio(
            window.matchMedia('(pointer: coarse)').matches
                ? 1
                : Math.min(window.devicePixelRatio, 2)
        );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.autoClear = false;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.renderer.setClearColor(0x000000, 1);
    }

    // ── Scenes ────────────────────────────────────────────────────────────────
    setupScenes() {
        this.bgScene  = new THREE.Scene();
        this.bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        this.scene  = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.z = 14;
    }

    // ── Background & Particles ──────────────────────────────────────────────
    createNoiseBg() {
        // Removed to leave only image sans background
    }

    createParticles() {
        // Removed to leave only image sans background
    }

    // ── Neutral Cinematic Lighting ─────────────────────────────────────────────
    createLights() {
        // Ambient — subtle neutral dark fill
        this.scene.add(new THREE.AmbientLight(0x404040, 1.5));

        // Key light — strong neutral WHITE from front-left (main clarity)
        this.keyLight = new THREE.PointLight(0xffffff, 8.0, 65);
        this.keyLight.position.set(-5, 4, 12);
        this.scene.add(this.keyLight);

        // Fill light — very soft neutral fill from right
        this.fillLight = new THREE.PointLight(0xffffff, 2.0, 50);
        this.fillLight.position.set(7, -1, 9);
        this.scene.add(this.fillLight);

        // Rim / back light — subtle red for cinematic separation (optional/softened)
        this.rimLight = new THREE.PointLight(0xffffff, 4.0, 38);
        this.rimLight.position.set(3, 6, -6);
        this.scene.add(this.rimLight);

        // Top accent — pure white specular for highlights
        const top = new THREE.PointLight(0xffffff, 2.5, 30);
        top.position.set(0, 9, 10);
        this.scene.add(top);
    }

    // ── Red/Crimson glow aura texture ─────────────────────────────────────────
    _makeGlowTexture() {
        const S   = 512;
        const cvs = document.createElement('canvas');
        cvs.width = cvs.height = S;
        const ctx = cvs.getContext('2d');
        const cx  = S / 2, cy = S / 2, r = S / 2;

        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0.00, 'rgba(255,  30,  30, 1.00)'); // blazing red core
        g.addColorStop(0.12, 'rgba(230,  10,  10, 0.85)'); // hot red
        g.addColorStop(0.28, 'rgba(180,   0,   0, 0.55)'); // deep red
        g.addColorStop(0.50, 'rgba(120,   0,   0, 0.28)'); // dark crimson
        g.addColorStop(0.72, 'rgba( 60,   0,   0, 0.10)'); // near black-red
        g.addColorStop(1.00, 'rgba(  0,   0,   0, 0.00)'); // transparent

        ctx.fillStyle = g;
        ctx.fillRect(0, 0, S, S);
        return new THREE.CanvasTexture(cvs);
    }

    // ── Load portrait as 3D plane ─────────────────────────────────────────────
    loadPortrait() {
        new THREE.TextureLoader().load('NV-IMG/heroP1.png', (tex) => {
            tex.generateMipmaps  = true;
            tex.minFilter        = THREE.LinearMipmapLinearFilter;
            tex.magFilter        = THREE.LinearFilter;
            tex.anisotropy       = this.renderer.capabilities.getMaxAnisotropy();

            const aspect = tex.image.width / tex.image.height;
            const H = 8.8, W = H * aspect;

            this.portraitGroup = new THREE.Group();

            // Glows removed to leave only image sans background

            // ── Portrait plane (Basic material for default colors) ────
            const geo = new THREE.PlaneGeometry(W, H, 1, 1);
            const mat = new THREE.MeshBasicMaterial({
                map:         tex,
                transparent: true,
                alphaTest:   0.001,
                side:        THREE.DoubleSide,
            });
            this.portraitMesh = new THREE.Mesh(geo, mat);
            this.portraitMesh.position.z = 0.01;
            this.portraitGroup.add(this.portraitMesh);

            // ── Reflection ghost below ────────────────────────────────
            const reflMat = new THREE.MeshBasicMaterial({
                map:         tex,
                transparent: true,
                opacity:     0.07,
                depthWrite:  false,
            });
            const reflMesh = new THREE.Mesh(new THREE.PlaneGeometry(W, H * 0.35), reflMat);
            reflMesh.position.y  = -H / 2 - H * 0.175;
            reflMesh.position.z  = -0.05;
            reflMesh.scale.y     = -1;
            this.portraitGroup.add(reflMesh);

            this.scene.add(this.portraitGroup);
            this.portraitGroup.position.x = 0;
            this.portraitGroup.position.y = 0;
            this.portraitGroup.position.z = 0;


            // ── Entrance pop-in animation ─────────────────────────────
            if (typeof gsap !== 'undefined') {
                this.portraitGroup.scale.set(0.75, 0.75, 0.75);
                gsap.to(this.portraitGroup.scale, {
                    x: 1, y: 1, z: 1,
                    duration: 2.0,
                    ease: 'expo.out',
                    delay: 0.4,
                });
                if (this.glowMesh) {
                    gsap.from(this.glowMesh.material, {
                        opacity: 0,
                        duration: 2.8,
                        ease: 'power2.out',
                        delay: 0.5,
                    });
                }
                if (this.outerGlowMesh) {
                    gsap.from(this.outerGlowMesh.material, {
                        opacity: 0,
                        duration: 3.5,
                        ease: 'power1.out',
                        delay: 0.8,
                    });
                }
            }

            window.dispatchEvent(new CustomEvent('heroPortraitReady'));

        }, undefined, (err) => {
            console.warn('[Hero3D] Portrait texture failed to load:', err);
            window.dispatchEvent(new CustomEvent('heroPortraitReady'));
        });
    }

    // ── Public API consumed by hero-scroll-reveal.js ──────────────────────────
    exposeAPI() {
        const self = this;
        window.heroPortrait = {
            setX(x)           { self._targetX  = x; },
            setRotationY(ry)  { self._targetRY = ry; },
            setScale(s)       { self._targetScale = s; },
            setGlow(intensity){ self._targetGlow = Math.min(1, Math.max(0, intensity)); },
            isReady()         { return !!self.portraitGroup; },
        };
    }

    // ── Events ────────────────────────────────────────────────────────────────
    bindEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            if (this.noiseMat)
                this.noiseMat.uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
            // Re-render after a resize (the drawing buffer is reallocated)
            this.renderOnce();
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isActive) return;
            this.targetMouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Hover glow boost
        this.canvas.addEventListener('mouseenter', () => {
            if (this._baseGlow !== undefined) return;
            this._hoverActive = true;
        });
        this.canvas.addEventListener('mouseleave', () => {
            this._hoverActive = false;
        });
    }

    // ── Static render ─────────────────────────────────────────────────────────
    // The scene is now a static black backdrop (noise/particles/portrait were
    // removed), so we render ONE frame and stop the RAF loop. This saves a
    // full-screen WebGL render every animation frame for the whole session.
    renderOnce() {
        if (this.portraitGroup || this.noiseMat || this.particles) {
            this.renderer.clear();
            this.renderer.render(this.bgScene, this.bgCamera);
            this.renderer.clearDepth();
            this.renderer.render(this.scene, this.camera);
        } else {
            this.renderer.clear();
        }
    }

    animate() {
        this.renderOnce();
    }
}

// ── Bootstrap ────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new Hero3DScene());
} else {
    new Hero3DScene();
}
