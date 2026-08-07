import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

class Contact3DScene {
    constructor() {
        this.canvas = document.getElementById('contact-3d-canvas');
        if (!this.canvas) return;

        this.mouse = new THREE.Vector2();
        this.targetMouse = new THREE.Vector2();

        // Setup Colors
        this.colors = {
            base: new THREE.Color(0xe50000), // Default Red
            name: new THREE.Color(0x3b82f6), // Blue
            email: new THREE.Color(0x10b981), // Green
            subject: new THREE.Color(0x8b5cf6), // Purple
            message: new THREE.Color(0xf59e0b) // Yellow/Orange
        };
        this.targetColor = this.colors.base.clone();
        this.isActive = false; // Add flag for culling rendering

        this.init();
        this.setupFormListeners();

        // Listen to section manager to disable rendering if not needed
        window.addEventListener('sectionChange', (e) => {
            this.isActive = (e.detail.id === 'contact');
        });
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(45, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 100);
        this.camera.position.z = 5;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setPixelRatio(
            window.matchMedia('(pointer: coarse)').matches
                ? 1
                : Math.min(window.devicePixelRatio, 2)
        );
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 2);
        spotLight.position.set(0, 5, 5);
        this.scene.add(spotLight);

        // Object: Torus Knot (Complex shape that looks cool rotating)
        const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
        this.material = new THREE.MeshPhysicalMaterial({
            color: this.colors.base,
            metalness: 0.8,
            roughness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.scene.add(this.mesh);

        // Events
        window.addEventListener('resize', this.onWindowResize.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));

        // Start Loop
        this.clock = new THREE.Clock();
        this.animate();
    }

    setupFormListeners() {
        const inputs = [
            { id: 'name', type: 'name' },
            { id: 'email', type: 'email' },
            { id: 'subject', type: 'subject' },
            { id: 'message', type: 'message' }
        ];

        inputs.forEach(({ id, type }) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('focus', () => {
                    this.targetColor = this.colors[type];
                });
                el.addEventListener('blur', () => {
                    this.targetColor = this.colors.base;
                });
            }
        });
    }

    onWindowResize() {
        if (!this.camera || !this.renderer || !this.canvas) return;

        const width = this.canvas.parentElement.clientWidth;
        const height = this.canvas.parentElement.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    onMouseMove(event) {
        // Normalize mouse coordinates (-1 to +1)
        this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        if (!this.isActive) return;

        const elapsedTime = this.clock.getElapsedTime();

        // Smooth mouse interpolation
        this.mouse.lerp(this.targetMouse, 0.05);

        if (this.mesh) {
            // Idle rotation
            this.mesh.rotation.x = elapsedTime * 0.2 + this.mouse.y * 0.5;
            this.mesh.rotation.y = elapsedTime * 0.3 + this.mouse.x * 0.5;

            // Color Lerp
            if (this.material && this.targetColor) {
                this.material.color.lerp(this.targetColor, 0.05);
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Global initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new Contact3DScene());
} else {
    new Contact3DScene();
}
