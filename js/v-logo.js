/**
 * V Logo — Electric Lightning Version
 * Supprime le fond noir et anime avec des éclairs, lueurs néon (motion blur simulé par filtres)
 */
(function () {
    function initVLogo() {
        const img = document.getElementById('contact-v-source');
        const canvas = document.getElementById('contact-v-canvas');
        if (!img || !canvas) return;

        const ctx = canvas.getContext('2d');
        let originalPixels = null; 

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
            const THRESHOLD = 55;

            // Rendre le fond noir transparent
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const brightness = r + g + b;

                if (brightness < THRESHOLD) {
                    data[i + 3] = 0;
                } else if (brightness < THRESHOLD * 2) {
                    const ratio = (brightness - THRESHOLD) / THRESHOLD;
                    data[i + 3] = Math.round(255 * ratio);
                }
            }

            originalPixels = new Uint8ClampedArray(data);
            ctx.putImageData(imageData, 0, 0);
            
            // Add intense CSS neon glow Drop Shadows
            canvas.style.filter = "drop-shadow(0 0 15px rgba(255, 0, 0, 0.8)) drop-shadow(0 0 30px rgba(255, 50, 50, 0.6))";
            
            requestAnimationFrame(animateColor);
        }

        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;

        document.addEventListener('mousemove', (e) => {
            targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        });
        
        // Lightning spark particles
        let sparks = [];

        function animateColor(timestamp) {
            if (!originalPixels) return;

            const W = canvas.width;
            const H = canvas.height;

            mouseX += (targetX - mouseX) * 0.1;
            mouseY += (targetY - mouseY) * 0.1;

            // Energetic jiggle and tilt
            const moveStrength = 20; 
            const jitterX = (Math.random() - 0.5) * 5; // Glitch shake
            const jitterY = (Math.random() - 0.5) * 5;
            canvas.style.transform = `translate(${mouseX * moveStrength + jitterX}px, ${mouseY * moveStrength + jitterY}px) rotate(${mouseX * 10}deg) scale(1.02)`;

            // Electric flickering interpolation
            let t = Math.abs(Math.sin((timestamp / 400) * Math.PI));
            // Random lightning flash overexposure
            const isFlash = Math.random() < 0.08;
            if (isFlash) t = 1.2; // Overbright

            // Deep Red to Electric Bright Red/White
            const baseR = 180, baseG = 0, baseB = 0;
            const whiteR = 255, whiteG = 200, whiteB = 200;

            const imageData = ctx.createImageData(W, H);
            const data = imageData.data;
            const src = originalPixels;

            for (let i = 0; i < data.length; i += 4) {
                const alpha = src[i + 3];
                if (alpha > 0) {
                    let r = baseR + (whiteR - baseR) * t;
                    let g = baseG + (whiteG - baseG) * t;
                    let b = baseB + (whiteB - baseB) * t;
                    
                    data[i] = Math.min(255, Math.max(0, r));
                    data[i + 1] = Math.min(255, Math.max(0, g));
                    data[i + 2] = Math.min(255, Math.max(0, b));
                    data[i + 3] = alpha;
                }
            }

            // Draw base pixel replacements
            ctx.putImageData(imageData, 0, 0);

            // Overlay Lightning drawing
            if (isFlash) {
                drawLightningFlash(ctx, W, H);
                // Create sparks
                for(let k = 0; k < 5; k++) {
                    sparks.push({
                        x: Math.random() * W,
                        y: Math.random() * H,
                        vx: (Math.random() - 0.5) * 40,
                        vy: (Math.random() - 0.5) * 40,
                        life: 1
                    });
                }
            }

            // Animate and draw sparks
            drawSparks(ctx, W, H);

            requestAnimationFrame(animateColor);
        }

        function drawLightningFlash(ctx, W, H) {
            ctx.save();
            ctx.globalCompositeOperation = "screen";
            ctx.lineCap = "round";
            
            let startX = W * 0.5 + (Math.random() - 0.5) * 150;
            let startY = 0;
            let endX = W * 0.5 + (Math.random() - 0.5) * 150;
            let endY = H;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            let x = startX, y = startY;
            const steps = 8;
            for (let i = 0; i < steps; i++) {
                x += (endX - startX) / steps + (Math.random() - 0.5) * 60;
                y += (endY - startY) / steps;
                ctx.lineTo(x, y);
            }
            
            ctx.shadowBlur = 30;
            ctx.shadowColor = "#ff0000";
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2 + Math.random() * 4;
            ctx.stroke();

            // Branching
            if (Math.random() > 0.5) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + (Math.random() - 0.5) * 100, y + 50);
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            ctx.restore();
        }

        function drawSparks(ctx, W, H) {
            for (let i = sparks.length - 1; i >= 0; i--) {
                let s = sparks[i];
                s.x += s.vx;
                s.y += s.vy;
                s.life -= 0.1;
                
                if (s.life <= 0) {
                    sparks.splice(i, 1);
                    continue;
                }
                
                ctx.save();
                ctx.globalCompositeOperation = "screen";
                ctx.fillStyle = "#ffffff";
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#ff0000";
                ctx.globalAlpha = s.life;
                ctx.beginPath();
                ctx.arc(s.x, s.y, Math.random() * 3 + 1, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
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
