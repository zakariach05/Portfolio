document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('particles-container');

    if (!container) return; // Sécurité si l'élément n'existe pas

    // --- 1. Initialisation de la Scène ---
    const scene = new THREE.Scene();

    // Caméra perspective
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 120; // Reculer la caméra pour voir les particules

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // Alpha true pour fond transparent
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Netteté sur écrans HD
    container.appendChild(renderer.domElement);

    // --- 2. Création des Particules (BufferGeometry) ---
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 3000; // Augmenté pour plus de densité

    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 500; // Plus large pour remplir l'espace
        originalPositions[i] = positions[i];
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 1.5,
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- 2.5 Ajouter un objet 3D Central (Torus Knot) pour l'effet "WOW" ---
    const torusGeometry = new THREE.TorusKnotGeometry(20, 0.5, 100, 16);
    const torusMaterial = new THREE.MeshPhongMaterial({
        color: 0x3b82f6,
        emissive: 0x2141ce,
        specular: 0xffffff,
        shininess: 100,
        transparent: true,
        opacity: 0.3,
        wireframe: true
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    scene.add(torus);

    // Lumière pour l'objet 3D
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // --- 3. Interaction Souris ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = container.clientWidth / 2;
    const windowHalfY = container.clientHeight / 2;

    document.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        mouseX = (event.clientX - rect.left) - windowHalfX;
        mouseY = (event.clientY - rect.top) - windowHalfY;
    });

    // --- 4. Boucle d'Animation ---
    const repulsionRadius = 80;
    const repulsionForce = 5;
    const returnSpeed = 0.04;

    function animate() {
        requestAnimationFrame(animate);

        targetX = mouseX * 0.1;
        targetY = mouseY * -0.1;

        // Animation douce de la caméra
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (targetY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        const positions = particlesGeometry.attributes.position.array;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            let px = positions[i3];
            let py = positions[i3 + 1];
            const ox = originalPositions[i3];
            const oy = originalPositions[i3 + 1];
            const oz = originalPositions[i3 + 2];

            const dx = (mouseX * 0.5) - px;
            const dy = (mouseY * -0.5) - py;
            const distSq = dx * dx + dy * dy;

            if (distSq < repulsionRadius * repulsionRadius) {
                const dist = Math.sqrt(distSq);
                const angle = Math.atan2(dy, dx);
                const force = (repulsionRadius - dist) / repulsionRadius;
                positions[i3] -= Math.cos(angle) * force * repulsionForce;
                positions[i3 + 1] -= Math.sin(angle) * force * repulsionForce;
            } else {
                positions[i3] += (ox - px) * returnSpeed;
                positions[i3 + 1] += (oy - py) * returnSpeed;
                positions[i3 + 2] += (oz - positions[i3 + 2]) * returnSpeed;
            }
        }

        particlesGeometry.attributes.position.needsUpdate = true;

        // Rotation de l'objet central
        torus.rotation.x += 0.01;
        torus.rotation.y += 0.015;

        // Oscillation légère
        torus.position.y = Math.sin(Date.now() * 0.001) * 5;

        particlesMesh.rotation.y += 0.0002;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    // Dark Mode Support
    const observer = new MutationObserver(() => {
        const isDark = document.documentElement.classList.contains('dark');
        particlesMaterial.color.setHex(isDark ? 0xffffff : 0x3b82f6);
        torusMaterial.color.setHex(isDark ? 0xffffff : 0x3b82f6);
        torusMaterial.emissive.setHex(isDark ? 0x2141ce : 0x000000);
        particlesMaterial.opacity = isDark ? 0.3 : 0.6;
    });
    observer.observe(document.documentElement, { attributes: true });

    if (document.documentElement.classList.contains('dark')) {
        particlesMaterial.color.setHex(0xffffff);
        torusMaterial.color.setHex(0xffffff);
    }
});
