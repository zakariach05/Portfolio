/**
 * V Logo — Electric Lightning Version
 * Drives the same animation on:
 *   1. #contact-v-canvas  (contact section)
 *   2. #splash-v-canvas   (splash screen)
 *   3. #header-v-canvas   (fixed header)
 */
(function () {

    /**
     * Creates one self-contained electric-V animator bound to a canvas + img pair.
     * @param {HTMLCanvasElement} canvas
     * @param {HTMLImageElement}  img
     * @param {object}            opts  – { glowScale, jitterStrength, moveStrength }
     */
    function createVAnimator(canvas, img, opts) {
        opts = Object.assign({ glowScale: 1, jitterStrength: 5, moveStrength: 20 }, opts);

        const ctx = canvas.getContext('2d');
        let originalPixels = null;
        let animFrameId    = null;

        // ── Mouse parallax (shared global target, individual lerp per instance) ──
        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;

        document.addEventListener('mousemove', (e) => {
            targetX = (e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2);
            targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        });

        // ── Sparks ──
        let sparks = [];

        function extractPixels() {
            const W = img.naturalWidth;
            const H = img.naturalHeight;
            if (!W || !H) return;

            canvas.width  = W;
            canvas.height = H;

            ctx.clearRect(0, 0, W, H);
            ctx.drawImage(img, 0, 0, W, H);

            const imageData = ctx.getImageData(0, 0, W, H);
            const data      = imageData.data;
            const THRESHOLD = 55;

            // Remove black background
            for (let i = 0; i < data.length; i += 4) {
                const brightness = data[i] + data[i + 1] + data[i + 2];
                if (brightness < THRESHOLD) {
                    data[i + 3] = 0;
                } else if (brightness < THRESHOLD * 2) {
                    data[i + 3] = Math.round(255 * (brightness - THRESHOLD) / THRESHOLD);
                }
            }

            originalPixels = new Uint8ClampedArray(data);
            ctx.putImageData(imageData, 0, 0);

            const g = opts.glowScale;
            canvas.style.filter =
                `drop-shadow(0 0 ${15 * g}px rgba(255,0,0,0.85)) ` +
                `drop-shadow(0 0 ${30 * g}px rgba(255,50,50,0.6))`;

            animFrameId = requestAnimationFrame(animateColor);
        }

        function animateColor(timestamp) {
            if (!originalPixels) return;

            const W = canvas.width;
            const H = canvas.height;

            // Smooth mouse lerp
            mouseX += (targetX - mouseX) * 0.1;
            mouseY += (targetY - mouseY) * 0.1;

            // Jitter + tilt
            const jX = (Math.random() - 0.5) * opts.jitterStrength;
            const jY = (Math.random() - 0.5) * opts.jitterStrength;
            canvas.style.transform =
                `translate(${mouseX * opts.moveStrength + jX}px, ${mouseY * opts.moveStrength + jY}px) ` +
                `rotate(${mouseX * 10}deg) scale(1.02)`;

            // Electric pulse
            let t        = Math.abs(Math.sin((timestamp / 400) * Math.PI));
            const isFlash = Math.random() < 0.08;
            if (isFlash) t = 1.2;

            // Deep red → electric white-red
            const baseR = 180, baseG = 0,   baseB = 0;
            const hitR  = 255, hitG  = 200, hitB  = 200;

            const imageData = ctx.createImageData(W, H);
            const data      = imageData.data;
            const src       = originalPixels;

            for (let i = 0; i < data.length; i += 4) {
                const alpha = src[i + 3];
                if (alpha > 0) {
                    data[i]     = Math.min(255, baseR + (hitR - baseR) * t);
                    data[i + 1] = Math.min(255, baseG + (hitG - baseG) * t);
                    data[i + 2] = Math.min(255, baseB + (hitB - baseB) * t);
                    data[i + 3] = alpha;
                }
            }

            ctx.putImageData(imageData, 0, 0);

            // Lightning bolt on flash
            if (isFlash) {
                drawLightningFlash(ctx, W, H);
                for (let k = 0; k < 5; k++) {
                    sparks.push({
                        x: Math.random() * W,  y: Math.random() * H,
                        vx: (Math.random() - 0.5) * 40,
                        vy: (Math.random() - 0.5) * 40,
                        life: 1
                    });
                }
            }

            drawSparks(ctx);

            animFrameId = requestAnimationFrame(animateColor);
        }

        function drawLightningFlash(ctx, W, H) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';

            let x = W * 0.5 + (Math.random() - 0.5) * 150;
            let y = 0;
            const endX = W * 0.5 + (Math.random() - 0.5) * 150;
            const endY = H;

            ctx.beginPath();
            ctx.moveTo(x, y);
            const steps = 8;
            for (let i = 0; i < steps; i++) {
                x += (endX - x) / (steps - i) + (Math.random() - 0.5) * 60;
                y += (endY - 0) / steps;
                ctx.lineTo(x, y);
            }
            ctx.shadowBlur   = 30;
            ctx.shadowColor  = '#ff0000';
            ctx.strokeStyle  = '#ffffff';
            ctx.lineWidth    = 2 + Math.random() * 4;
            ctx.stroke();

            if (Math.random() > 0.5) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + (Math.random() - 0.5) * 100, y + 50);
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            ctx.restore();
        }

        function drawSparks(ctx) {
            for (let i = sparks.length - 1; i >= 0; i--) {
                const s = sparks[i];
                s.x   += s.vx;
                s.y   += s.vy;
                s.life -= 0.1;
                if (s.life <= 0) { sparks.splice(i, 1); continue; }

                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle   = '#ffffff';
                ctx.shadowBlur  = 10;
                ctx.shadowColor = '#ff0000';
                ctx.globalAlpha = s.life;
                ctx.beginPath();
                ctx.arc(s.x, s.y, Math.random() * 3 + 1, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Boot
        if (img.complete && img.naturalWidth > 0) {
            extractPixels();
        } else {
            img.onload = extractPixels;
        }

        return { stop: () => cancelAnimationFrame(animFrameId) };
    }

    // ═══════════════════════════════════════════════
    // INIT ALL THREE CANVASES
    // ═══════════════════════════════════════════════
    function init() {
        // 1. Contact section — full-size, full jitter
        const contactImg    = document.getElementById('contact-v-source');
        const contactCanvas = document.getElementById('contact-v-canvas');
        if (contactImg && contactCanvas) {
            createVAnimator(contactCanvas, contactImg, {
                glowScale:      1,
                jitterStrength: 5,
                moveStrength:   20
            });
        }

        // 2. Splash screen — same full effect
        const splashImg    = document.getElementById('splash-v-source');
        const splashCanvas = document.getElementById('splash-v-canvas');
        if (splashImg && splashCanvas) {
            createVAnimator(splashCanvas, splashImg, {
                glowScale:      1.2,
                jitterStrength: 6,
                moveStrength:   18
            });
        }

        // 3. Header — compact but visible electric effect for the 80px logo
        const headerImg    = document.getElementById('header-v-source');
        const headerCanvas = document.getElementById('header-v-canvas');
        if (headerImg && headerCanvas) {
            createVAnimator(headerCanvas, headerImg, {
                glowScale:      0.8,
                jitterStrength: 2.5,
                moveStrength:   8
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
