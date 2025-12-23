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
    const count = 2000; // Nombre de particules (performance vs densité)

    // Tableaux pour stocker les positions
    const positions = new Float32Array(count * 3); // x, y, z
    const originalPositions = new Float32Array(count * 3); // Pour mémoriser la position "repos"

    // Distribution aléatoire
    for (let i = 0; i < count * 3; i++) {
        // Étendue aléatoire (x, y, z)
        // On étale plus large en X pour couvrir les écrans larges
        positions[i] = (Math.random() - 0.5) * 400;
        originalPositions[i] = positions[i];
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Matériau des points
    // Utilisation d'un dégradé de couleur selon le thème (géré via CSS classes normalement, ici hardcodé pour le bleu tech)
    const particlesMaterial = new THREE.PointsMaterial({
        size: 2,
        color: 0x3b82f6, // Bleu Tailwind (blue-500)
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true // Les particules loin sont plus petites
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- 3. Interaction Souris (Raycasting Logic simulation) ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Zone d'effet de la souris
    const windowHalfX = container.clientWidth / 2;
    const windowHalfY = container.clientHeight / 2;

    document.addEventListener('mousemove', (event) => {
        // Conversion des coordonnées de la souris (-1 à +1 par rapport au centre)
        // Note: On ajuste par rapport à la position du container dans la page
        const rect = container.getBoundingClientRect();
        mouseX = (event.clientX - rect.left) - windowHalfX;
        mouseY = (event.clientY - rect.top) - windowHalfY;
    });

    // --- 4. Boucle d'Animation ---
    const clock = new THREE.Clock();

    // Paramètres physiques
    const repulsionRadius = 60; // Rayon de répulsion autours de la souris
    const repulsionForce = 4; // Puissance
    const returnSpeed = 0.05; // Vitesse de retour à la position d'origine (Lerp factor)

    function animate() {
        requestAnimationFrame(animate);

        // Lissage du mouvement de la souris (target)
        targetX = mouseX * 0.5; // Scale mapping to world coords approx
        targetY = mouseY * -0.5; // Invert Y for 3D world

        const positions = particlesGeometry.attributes.position.array;

        // Boucle sur chaque particule
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Position actuelle
            let px = positions[i3];
            let py = positions[i3 + 1];
            let pz = positions[i3 + 2];

            // Position d'origine
            const ox = originalPositions[i3];
            const oy = originalPositions[i3 + 1];
            const oz = originalPositions[i3 + 2];

            // Calcul de la distance entre la souris (projetée dans le plan z=0 approx) et la particule
            // On considère la souris comme un "cylindre" de force infini en Z pour simplifier l'effet 2D layer
            const dx = targetX - px;
            const dy = targetY - py;

            // Distance au carré (plus rapide sans racine carrée pour la comparaison)
            const distSq = dx * dx + dy * dy;

            if (distSq < repulsionRadius * repulsionRadius) {
                // --- RÉPULSION ---
                // Si la souris est proche, on pousse la particule
                const dist = Math.sqrt(distSq);
                const angle = Math.atan2(dy, dx);
                const force = (repulsionRadius - dist) / repulsionRadius; // 0 à 1

                // On pousse à l'opposé de la souris
                const moveX = Math.cos(angle) * force * repulsionForce;
                const moveY = Math.sin(angle) * force * repulsionForce;

                positions[i3] -= moveX;
                positions[i3 + 1] -= moveY;
                // Petit effet de profondeur pour le fun
                positions[i3 + 2] += force * 0.5;
            } else {
                // --- RETOUR À L'ORIGINE (Elasticité) ---
                // Lerp simple : current + (target - current) * fraction
                positions[i3] += (ox - px) * returnSpeed;
                positions[i3 + 1] += (oy - py) * returnSpeed;
                positions[i3 + 2] += (oz - pz) * returnSpeed;
            }
        }

        // Marquer la géométrie comme devant être mise à jour
        particlesGeometry.attributes.position.needsUpdate = true;

        // Légère rotation globale pour donner de la vie même sans souris
        particlesMesh.rotation.y += 0.0005;
        particlesMesh.rotation.x += 0.0002;

        renderer.render(scene, camera);
    }

    animate();

    // --- 5. Redimensionnement ---
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    });

    // Dark Mode Support: Changement de couleur dynamique
    // On observe la classe 'dark' sur <html>
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const isDark = document.documentElement.classList.contains('dark');
                particlesMaterial.color.setHex(isDark ? 0xffffff : 0x3b82f6); // Blanc en sombre, Bleu en clair
                particlesMaterial.opacity = isDark ? 0.4 : 0.6;
            }
        });
    });
    observer.observe(document.documentElement, { attributes: true });

    // Initial check color
    if (document.documentElement.classList.contains('dark')) {
        particlesMaterial.color.setHex(0xffffff);
        particlesMaterial.opacity = 0.4;
    }

});
