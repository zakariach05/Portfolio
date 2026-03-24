/**
 * V Logo — Supprime le fond noir ET anime la couleur entre rouge et blanc
 * en modifiant directement les pixels RGB du canvas via requestAnimationFrame
 */
(function () {
    function initVLogo() {
        const img = document.getElementById('contact-v-source');
        const canvas = document.getElementById('contact-v-canvas');
        if (!img || !canvas) return;

        const ctx = canvas.getContext('2d');
        let originalPixels = null; // Pixels d'origine (rouge du V sans fond)

        function extractPixels() {
            const W = img.naturalWidth;
            const H = img.naturalHeight;
            if (!W || !H) return;

            canvas.width = W;
            canvas.height = H;

            // Dessiner l'image originale
            ctx.clearRect(0, 0, W, H);
            ctx.drawImage(img, 0, 0, W, H);

            const imageData = ctx.getImageData(0, 0, W, H);
            const data = imageData.data;
            const THRESHOLD = 55; // Seuil de noirceur

            // Supprimer le fond noir → rendre transparent
            // Conserver les pixels colorés (rouge du V)
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const brightness = r + g + b;

                if (brightness < THRESHOLD) {
                    // Pixel sombre → transparent
                    data[i + 3] = 0;
                } else if (brightness < THRESHOLD * 2) {
                    // Zone de transition → demi-transparent (anti-aliasing)
                    const ratio = (brightness - THRESHOLD) / THRESHOLD;
                    data[i + 3] = Math.round(255 * ratio);
                }
            }

            // Stocker les pixels originaux (sans fond) pour l'animation
            originalPixels = new Uint8ClampedArray(data);
            ctx.putImageData(imageData, 0, 0);

            // Démarrer l'animation de couleur
            requestAnimationFrame(animateColor);
        }

        /**
         * Animate: interpole chaque pixel visible entre rouge pur et blanc pur.
         * Les pixels transparents (fond supprimé) restent transparents.
         * Rouge pur → Blanc → Rouge pur en boucle
         */
        function animateColor(timestamp) {
            if (!originalPixels) return;

            const W = canvas.width;
            const H = canvas.height;

            // t oscille entre 0 et 1 via sinus (période ~2.5s)
            const t = (Math.sin((timestamp / 1250) * Math.PI) + 1) / 2;
            // t=0 → rouge pur, t=1 → blanc pur

            // Couleurs cibles
            const redR = 220, redG = 38, redB = 38;
            const whiteR = 255, whiteG = 255, whiteB = 255;

            const imageData = ctx.createImageData(W, H);
            const data = imageData.data;
            const src = originalPixels;

            for (let i = 0; i < data.length; i += 4) {
                const alpha = src[i + 3];
                if (alpha === 0) {
                    // Pixel transparent → reste transparent
                    data[i] = 0;
                    data[i + 1] = 0;
                    data[i + 2] = 0;
                    data[i + 3] = 0;
                } else {
                    // Interpoler entre rouge pur et blanc pur
                    data[i] = Math.round(redR + (whiteR - redR) * t); // R
                    data[i + 1] = Math.round(redG + (whiteG - redG) * t); // G
                    data[i + 2] = Math.round(redB + (whiteB - redB) * t); // B
                    data[i + 3] = alpha; // Conserver la transparence originale
                }
            }

            ctx.putImageData(imageData, 0, 0);
            requestAnimationFrame(animateColor);
        }

        if (img.complete && img.naturalWidth > 0) {
            extractPixels();
        } else {
            img.onload = extractPixels;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVLogo);
    } else {
        initVLogo();
    }
})();
