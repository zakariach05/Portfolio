/**
 * Hero Scan Animation with Three.js
 * Ensures text reveal happens even if 3D fails
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

class HeroScanAnimation {
    constructor() {
        this.canvas = document.getElementById('scan-canvas');
        this.heroImage = document.getElementById('hero-face-img');
        this.heroTextContent = document.getElementById('hero-text-content');
        this.textRevealed = false;

        // If elements missing, try to find text and force show it
        if (!this.canvas || !this.heroImage) {
            console.warn('Scan elements missing, forcing text reveal');
            this.revealHeroText();
            return;
        }

        this.init();
    }

    init() {
        try {
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.createScanPlane();

            // Start scan animation
            setTimeout(() => {
                this.startScan();
            }, 1000);
        } catch (e) {
            console.error("Three.js init error:", e);
        }

        // SAFETY: Force reveal text after 3.5 seconds in case animation fails or halts
        setTimeout(() => {
            if (!this.textRevealed) {
                console.log("Force revealing text (safety timeout)");
                this.revealHeroText();
            }
        }, 3500);
    }

    setupScene() {
        this.scene = new THREE.Scene();
    }

    setupCamera() {
        this.camera = new THREE.OrthographicCamera(
            -1, 1, 1, -1, 0.1, 10
        );
        this.camera.position.z = 1;
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });

        const container = this.canvas.parentElement;
        const resize = () => {
            const rect = container.getBoundingClientRect();
            this.renderer.setSize(rect.width, rect.height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };

        window.addEventListener('resize', resize);
        resize();
    }

    createScanPlane() {
        const geometry = new THREE.PlaneGeometry(2, 2);
        const textureLoader = new THREE.TextureLoader();

        // Load local texture
        textureLoader.load(
            'NV-IMG/scanne.png',
            (texture) => {
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0,
                    side: THREE.DoubleSide
                });
                this.scanPlane = new THREE.Mesh(geometry, material);
                this.scene.add(this.scanPlane);
            },
            undefined,
            (err) => {
                // Fallback: Red line if image missing
                console.warn('Scan texture missing, using fallback line');
                const material = new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                    transparent: true,
                    opacity: 0,
                    wireframe: true
                });
                this.scanPlane = new THREE.Mesh(geometry, material);
                this.scene.add(this.scanPlane);
            }
        );
    }

    startScan() {
        if (!this.scanPlane) {
            // Retry briefly then give up
            setTimeout(() => {
                if (!this.scanPlane) return;
                this.startScan();
            }, 100);
            return;
        }

        // Use GSAP if available, otherwise simple fallback
        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline({
                onComplete: () => this.revealHeroText()
            });

            tl.to(this.scanPlane.material, { opacity: 0.8, duration: 0.3 })
                .to(this.scanPlane.position, {
                    y: -0.5, duration: 2, ease: 'linear',
                    onUpdate: () => this.renderer.render(this.scene, this.camera)
                }, '-=0.1')
                .to(this.scanPlane.material, {
                    opacity: 0, duration: 0.5,
                    onUpdate: () => this.renderer.render(this.scene, this.camera)
                });

            this.animate();
        } else {
            // No GSAP? Just show text
            this.revealHeroText();
        }
    }

    animate() {
        if (this.scanPlane && this.scanPlane.material.opacity > 0) {
            requestAnimationFrame(() => this.animate());
            this.renderer.render(this.scene, this.camera);
        }
    }

    revealHeroText() {
        if (this.textRevealed) return;
        this.textRevealed = true;

        if (this.heroTextContent) {
            // Remove transform and opacity classes manually if GSAP fails
            this.heroTextContent.classList.remove('opacity-0', '-translate-x-10');
            this.heroTextContent.style.opacity = '1';
            this.heroTextContent.style.transform = 'translateX(0)';

            if (typeof gsap !== 'undefined') {
                gsap.fromTo(this.heroTextContent,
                    { opacity: 0, x: -50 },
                    { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }
                );
            }
        }
    }
}

// Global initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new HeroScanAnimation());
} else {
    new HeroScanAnimation();
}
