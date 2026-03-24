import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

// ─── NOISE BACKGROUND SHADER ────────────────────────────────────────────────
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

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}
void main() {
  vec2 q = vUv * 3.0;
  float n = fbm(q + uTime * 0.08);
  float n2 = fbm(q + n + uTime * 0.04);
  float col = fbm(q + n2);

  // Dark palette: near-black to dark grey
  vec3 dark  = vec3(0.04, 0.04, 0.04);
  vec3 mid   = vec3(0.10, 0.10, 0.10);
  vec3 accent= vec3(0.20, 0.02, 0.02); // subtle red tinge

  vec3 color = mix(dark, mid, col);
  color = mix(color, accent, smoothstep(0.5, 0.8, n2) * 0.4);
  gl_FragColor = vec4(color, 1.0);
}`;

// ─── MAIN SCENE ─────────────────────────────────────────────────────────────
class Hero3DScene {
    constructor() {
        this.canvas = document.getElementById('hero-3d-canvas');
        if (!this.canvas) return;

        this.slices = [];
        this.SLICES = 10;
        this.mouse = new THREE.Vector2();
        this.targetMouse = new THREE.Vector2();
        this.sliceGroup = null;
        this.clock = new THREE.Clock();
        this.scrollY = 0;
        this.maxScroll = window.innerHeight; // hero is 100vh
        this.isActive = true; // Add flag for culling rendering

        this.setupRenderer();
        this.setupScenes();
        this.createNoiseBg();
        this.createParticles();
        this.createSlices();   // scroll anims init inside after texture load
        this.initRolesGlitch();
        this.bindEvents();
        // Listen to section manager to disable rendering if not needed
        window.addEventListener('sectionChange', (e) => {
            this.isActive = (e.detail.id === 'home' || e.detail.id === 'about');
            // Hero or About (About overlaps Hero usually), if further down, disable!
        });
        this.animate();
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: false,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.autoClear = false;
    }

    setupScenes() {
        // Scene 1: 2D noise background quad
        this.bgScene = new THREE.Scene();
        this.bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // Scene 2: 3D content
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.z = 15;
    }

    createNoiseBg() {
        this.noiseMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },
            vertexShader: NOISE_VERT,
            fragmentShader: NOISE_FRAG
        });
        const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.noiseMat);
        this.bgScene.add(bgMesh);
    }

    createParticles() {
        const geo = new THREE.BufferGeometry();
        const n = 400;
        const pos = new Float32Array(n * 3);
        for (let i = 0; i < n * 3; i++) pos[i] = (Math.random() - 0.5) * 35;
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.05, color: 0xffffff, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);

        // Lighting
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.9));
        const spot = new THREE.SpotLight(0xffffff, 3);
        spot.position.set(0, 10, 10);
        spot.angle = Math.PI / 4;
        spot.penumbra = 0.6;
        this.scene.add(spot);
        const fill = new THREE.DirectionalLight(0xe50000, 0.6);
        fill.position.set(-5, -5, 5);
        this.scene.add(fill);
    }

    createSlices() {
        new THREE.TextureLoader().load('NV-IMG/heroP1.png', (tex) => {
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;

            const aspect = tex.image.width / tex.image.height;
            const H = 12, W = H * aspect;

            this.sliceGroup = new THREE.Group();

            // Photo par défaut (sans découpage en parties)
            const geo = new THREE.PlaneGeometry(W, H);
            const mat = new THREE.MeshPhysicalMaterial({
                map: tex, transparent: true, roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geo, mat);

            this.sliceGroup.add(mesh);
            this.slices = [mesh]; // Keep original array name to avoid breaking other methods
            this.scene.add(this.sliceGroup);

            // Pop-in entrance
            gsap.from(this.sliceGroup.scale, { x: 0, y: 0, z: 0, duration: 1.8, ease: 'expo.out', delay: 0.6 });
            gsap.from('#hero-name-overlay', { opacity: 0, y: 80, duration: 1.2, ease: 'power3.out', delay: 0.9 });
            gsap.from('#hero-role-container', { opacity: 0, y: 50, duration: 1.2, ease: 'power3.out', delay: 1.2 });
            gsap.from('#hero-extra-info', { opacity: 0, y: 30, duration: 1.0, ease: 'power3.out', delay: 1.5 });
            gsap.from('#hero-scroll-indicator', { opacity: 0, duration: 1.2, delay: 2.2 });

            this.initScrollAnimations();
            if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 300);
        }, undefined, () => {
            // Fallback: still run scroll setup without slices
            this.initScrollAnimations();
        });
    }

    initRolesGlitch() {
        const el = document.getElementById('hero-role-text');
        if (!el) return;
        const roles = ['Développeur', 'Designer', 'Créatif'];
        const chars = '!<>-_\\/[]{}—=+*^?#@$%';
        let idx = 0;
        const glitch = (target) => {
            let it = 0, total = target.length * 4;
            const iv = setInterval(() => {
                el.innerText = target.split('').map((c, i) =>
                    i < Math.floor(it / 4) ? c : chars[Math.floor(Math.random() * chars.length)]
                ).join('');
                if (++it > total) { clearInterval(iv); el.innerText = target; }
            }, 25);
        };
        setInterval(() => {
            idx = (idx + 1) % roles.length;
            el.style.color = idx === 1 ? '#e50000' : idx === 2 ? '#ff3366' : '#fff';
            glitch(roles[idx]);
        }, 3000);
    }

    initScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // Build curtain chars
        const ctEl = document.getElementById('curtain-text');
        if (ctEl) {
            ctEl.innerHTML = 'SELECTED WORKS'.split('').map(c =>
                c === ' ' ? '&nbsp;' : `<span class="curtain-char" style="display:inline-block;filter:blur(10px);opacity:0;">${c}</span>`
            ).join('');
        }

        // ── HERO SCROLL: scale + brightness + slice animation ──────────────
        const heroProxy = { progress: 0 };
        ScrollTrigger.create({
            trigger: '#home',
            start: 'top top',
            end: 'bottom top',
            scrub: 2.5, // Increased scrub for slower, smoother interpolation
            onUpdate: (self) => {
                const p = self.progress;

                // Hero section dim & scale
                const home = document.getElementById('home');
                if (home) {
                    home.style.transform = `scale(${1 - p * 0.08})`;
                    home.style.filter = `brightness(${1 - p * 0.7})`;
                }

                // Fade out UI text
                ['#hero-name-overlay', '#hero-role-container', '#hero-scroll-indicator', '#hero-extra-info'].forEach(sel => {
                    const el = document.querySelector(sel);
                    if (el) {
                        el.style.opacity = Math.max(0, 1 - p * 3);
                        el.style.transform = `translateY(${-p * 80}px)`;
                    }
                });

                // Animate slices (Zoom out / Backward movement)
                if (this.sliceGroup && this.slices.length) {
                    // Move the entire photo backward on the Z axis
                    this.sliceGroup.position.z = -p * 30; // Strong pull back
                    this.sliceGroup.scale.setScalar(Math.max(0.1, 1 - p * 0.7)); // Scale down slightly

                    this.slices.forEach(s => {
                        // Fade out correctly synchronized with scroll
                        s.material.opacity = Math.max(0, 1 - p * 1.4);
                    });
                }
            }
        });
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            if (this.noiseMat) this.noiseMat.uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
        });
        window.addEventListener('mousemove', (e) => {
            if (!this.isActive) return; // Prevent raycast/updates when not visible
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        // Click explode & reassemble
        this.canvas.addEventListener('click', () => {
            if (!this.sliceGroup || !this.slices.length) return;
            const tl = gsap.timeline();
            this.slices.forEach(s => {
                tl.to(s.position, { x: (Math.random() - 0.5) * 12, z: (Math.random() - 0.5) * 12, duration: 0.4, ease: 'power2.out' }, 0);
                tl.to(s.rotation, { x: (Math.random() - 0.5) * Math.PI, y: (Math.random() - 0.5) * Math.PI, duration: 0.4, ease: 'power2.out' }, 0);
                tl.to(s.position, { x: 0, z: 0, y: s.userData.baseY, duration: 1.2, ease: 'elastic.out(1,0.3)' }, 0.5);
                tl.to(s.rotation, { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1,0.3)' }, 0.5);
            });
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Critical Performance enhancement:
        // Do not render or calculate noise if section is inactive!
        if (!this.isActive) return;

        const t = this.clock.getElapsedTime();

        // Smooth mouse
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        // Noise bg always animates
        if (this.noiseMat) this.noiseMat.uniforms.uTime.value = t;

        // 3D interactions
        if (this.sliceGroup) {
            this.sliceGroup.rotation.y = this.mouse.x * 0.18;
            this.sliceGroup.rotation.x = -this.mouse.y * 0.10;
            this.slices.forEach((s, i) => {
                const wave = Math.sin(t * 1.2 + i * 0.6) * 0.06;
                s.position.z += (wave - s.position.z) * 0.06;
            });
        }
        if (this.particles) {
            this.particles.rotation.y = t * 0.03;
            this.particles.rotation.x = Math.sin(t * 0.08) * 0.04;
        }

        // Dual-scene render
        this.renderer.clear();
        this.renderer.render(this.bgScene, this.bgCamera);
        this.renderer.clearDepth();
        this.renderer.render(this.scene, this.camera);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new Hero3DScene());
} else {
    new Hero3DScene();
}
