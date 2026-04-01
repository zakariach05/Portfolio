// Advanced Animations — Marquee, 3D Grid, Expertise Shuffle, Signature
class AdvancedAnimations {
    constructor() {
        this.initMarquee();
        this.initProjectsGrid();
    }

    // ─── Marquee ────────────────────────────────────────────────────────────
    initMarquee() {
        if (typeof gsap === 'undefined') return;

        const marquees = [
            { selector: '.marquee-1', direction: -1, duration: 20 },
            { selector: '.marquee-2', direction: 1, duration: 25 },
            { selector: '.marquee-3', direction: -1, duration: 15 }
        ];

        this.marqueeTweens = [];

        marquees.forEach((m) => {
            const el = document.querySelector(m.selector);
            if (!el) return;

            el.innerHTML += el.innerHTML;
            const width = el.scrollWidth / 2;

            gsap.set(el, { x: m.direction === -1 ? 0 : -width });

            const tween = gsap.to(el, {
                x: m.direction === -1 ? -width : 0,
                duration: m.duration,
                ease: 'none',
                repeat: -1,
                modifiers: { x: gsap.utils.unitize(x => parseFloat(x) % width) }
            });

            this.marqueeTweens.push(tween);

            el.querySelectorAll('.marquee-word').forEach(word => {
                word.addEventListener('mouseenter', () => gsap.to(tween, { timeScale: 0.1, duration: 0.5 }));
                word.addEventListener('mouseleave', () => gsap.to(tween, { timeScale: 1, duration: 0.5 }));
            });
        });
    }

    // ─── Projects Grid ──────────────────────────────────────────────────────
    initProjectsGrid() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        document.querySelectorAll('.project-card-wrapper').forEach((card) => {
            gsap.fromTo(card,
                { y: 100, opacity: 0, scale: 0.95 },
                {
                    y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out',
                    scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' }
                }
            );

            const inner = card.querySelector('.project-card-3d');
            if (!inner) return;

            gsap.to(inner, {
                y: '-10%', ease: 'none',
                scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
            });

            inner.addEventListener('mousemove', (e) => {
                const r = inner.getBoundingClientRect();
                const xP = (e.clientX - r.left) / r.width - 0.5;
                const yP = (e.clientY - r.top) / r.height - 0.5;
                gsap.to(inner, {
                    rotateY: xP * 10, rotateX: -yP * 10, scale: 1.03,
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)', duration: 0.4, ease: 'power2.out'
                });
            });
            inner.addEventListener('mouseleave', () => {
                gsap.to(inner, {
                    rotateY: 0, rotateX: 0, scale: 1,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)', duration: 0.5, ease: 'power2.out'
                });
            });
        });
    }

    // ─── About Reveal ───────────────────────────────────────────────────────
    initAboutReveal() {
        if (!window.gsap || !window.ScrollTrigger) return;

        document.querySelectorAll('.reveal-type').forEach((el) => {
            const container = el.querySelector('.perspective-container');
            gsap.fromTo(container,
                { rotateX: 45, z: -500, opacity: 0, skewY: 5 },
                {
                    rotateX: 0, z: 0, opacity: 1, skewY: 0,
                    ease: 'power4.out',
                    scrollTrigger: { trigger: el, start: 'top 95%', end: 'bottom 20%', scrub: 1.5 }
                }
            );

            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                gsap.to(container, { rotateY: x * 20, rotateX: -y * 20, duration: 0.6, ease: 'power2.out' });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(container, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1,0.3)' });
            });
        });
    }

    // ─── Expertise Shuffle ──────────────────────────────────────────────────
    initExpertiseShuffle() {
        const stack = document.getElementById('expertise-stack');
        if (!stack || typeof gsap === 'undefined') return;

        const cards = stack.querySelectorAll('.expertise-card');

        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.playShuffleAnimation(cards);
                    entry.target._io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 }).observe(stack);
    }

    playShuffleAnimation(cards) {
        const tl = gsap.timeline();
        cards.forEach((card, i) => {
            tl.to(card, {
                x: (Math.random() - 0.5) * 500,
                y: (Math.random() - 0.5) * 400,
                rotation: (Math.random() - 0.5) * 30,
                scale: 0.95 + Math.random() * 0.1,
                opacity: 0.5,
                filter: 'blur(6px)',
                duration: 0.8,
                ease: 'power2.inOut'
            }, i * 0.15);
        });
        tl.to(cards, {
            x: 0, y: 0, rotation: 0, scale: 1,
            opacity: 1, filter: 'blur(0px)',
            duration: 1.6, ease: 'expo.out', stagger: 0.05,
            onComplete: () => gsap.set(cards, { clearProps: 'all' })
        }, '-=0.3');
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  SIGNATURE ANIMATION
    //  Key technique: path.getScreenCTM() — accounts for the inner
    //  <g transform="translate(0,1024) scale(0.1,-0.1)"> automatically.
    //  This is what makes the pen tip actually follow the ink stroke.
    // ═══════════════════════════════════════════════════════════════════════
    initSignatureAnimation() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        const section = document.getElementById('signature-section');
        const sigWrap = document.getElementById('sig-wrap');
        const sigSVG = document.getElementById('sig-svg');
        const penImg = document.getElementById('pen-img');
        const sigLine = document.getElementById('sig-line');

        if (!section || !penImg || !sigWrap || !sigSVG) return;

        // ── 1. Collect paths ───────────────────────────────────────────────
        const paths = ['sp1', 'sp2', 'sp3', 'sp4', 'sp5', 'sp6']
            .map(id => document.getElementById(id))
            .filter(Boolean);
        if (!paths.length) return;

        const lengths = paths.map(p => p.getTotalLength());
        const totalLen = lengths.reduce((a, b) => a + b, 0);

        // ── 2. Initialise stroke-dasharray ─────────────────────────────────
        paths.forEach((p, i) => {
            p.style.strokeDasharray = lengths[i];
            p.style.strokeDashoffset = lengths[i];
        });

        // ── 3. Pen constants ───────────────────────────────────────────────
        const PEN_W = 140;   // rendered image width in px
        const TIP_FX = 0.50;  // nib tip X fraction within image
        const TIP_FY = 0.97;  // nib tip Y fraction within image

        // ── 4. Coordinate helper — uses path.getScreenCTM() ───────────────
        // getScreenCTM() on the <path> element includes every ancestor
        // transform (including the <g transform="translate…scale…">),
        // so the result is always the true screen position of that path point.
        function svgPtToWrap(path, x, y) {
            const pt = sigSVG.createSVGPoint();
            pt.x = x;
            pt.y = y;
            const m = pt.matrixTransform(path.getScreenCTM());
            const box = sigWrap.getBoundingClientRect();
            return { x: m.x - box.left, y: m.y - box.top };
        }

        // Place pen image so its nib tip lands at screen point {sx, sy}
        function placePen(sx, sy) {
            const penH = penImg.offsetHeight || PEN_W;
            penImg.style.left = (sx - PEN_W * TIP_FX) + 'px';
            penImg.style.top = (sy - penH * TIP_FY) + 'px';
        }

        // Find the path + point at global progress t [0..1]
        function getPointAt(t) {
            const target = t * totalLen;
            let acc = 0;
            for (let i = 0; i < paths.length; i++) {
                const L = lengths[i];
                if (acc + L >= target || i === paths.length - 1) {
                    const local = Math.max(0, Math.min(1, (target - acc) / L));
                    return { path: paths[i], pt: paths[i].getPointAtLength(local * L) };
                }
                acc += L;
            }
        }

        // ── 5. Master sync — called every GSAP frame ───────────────────────
        function syncAll(t) {
            // a. Draw strokes
            let acc = 0;
            paths.forEach((p, i) => {
                const L = lengths[i];
                const start = acc / totalLen;
                const end = (acc + L) / totalLen;
                let drawn = 0;
                if (t >= end) drawn = L;
                else if (t > start) drawn = (t - start) / (end - start) * L;
                p.style.strokeDashoffset = L - drawn;
                acc += L;
            });

            // b. Move pen
            if (t > 0 && t < 1) {
                const { path, pt } = getPointAt(Math.min(t, 0.9999));
                const sc = svgPtToWrap(path, pt.x, pt.y);
                placePen(sc.x, sc.y);
            }
        }

        // ── 6. Initialise ──────────────────────────────────────────────────
        syncAll(0);
        penImg.style.opacity = '0';

        // Pre-position pen at the very start of the signature
        function placePenAtStart() {
            const { path, pt } = getPointAt(0.001);
            const sc = svgPtToWrap(path, pt.x, pt.y);
            placePen(sc.x, sc.y);
        }

        if (penImg.complete) {
            placePenAtStart();
        } else {
            penImg.addEventListener('load', placePenAtStart);
        }

        // ── 7. GSAP Timeline ───────────────────────────────────────────────
        const driver = { progress: 0 };

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top', // Triggers ONLY when the section fully enters the viewport
                end: '+=1500',    // Pins the section for 2500px, blocking next sections from scrolling over
                pin: true,        // Keeps it pinned
                toggleActions: 'play none none reverse' // Plays smoothly once, reverses when scrolling back up
            },
            onStart() {
                if (penImg) penImg.style.opacity = '1';
            }
        });

        tl
            // Write the signature + move the pen (2.4 s)
            .to(driver, {
                progress: 1,
                duration: 2.4,
                ease: 'power1.inOut',
                onUpdate() { syncAll(driver.progress); }
            }, 0.3)

            // Pen lifts off
            .to(penImg, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 2.5)

            // Bottom flourish line
            .to(sigLine, { width: '220px', opacity: 0.7, duration: 0.8, ease: 'power3.out' }, 2.4);

        // ── 8. Mouse parallax ──────────────────────────────────────────────
        section.addEventListener('mousemove', (e) => {
            const r = section.getBoundingClientRect();
            const rx = ((e.clientX - r.left) / r.width - 0.5) * 16;
            const ry = ((e.clientY - r.top) / r.height - 0.5) * -10;
            gsap.to(sigWrap, { rotateY: rx, rotateX: ry, duration: 0.6, ease: 'power2.out' });
        });

        section.addEventListener('mouseleave', () => {
            gsap.to(sigWrap, { rotateX: 0, rotateY: 0, duration: 1.3, ease: 'elastic.out(1,0.4)' });
        });
    }

    // ─── Pinned Overlapping Sections (Apple-like Overlap) ───────────────────────
    initPinnedOverlapEffects() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // 1. Setup Stacking Context to ensure sections slide OVER each other properly
        gsap.set('#projects', { zIndex: 40 });
        gsap.set('#signature-section', { zIndex: 50 });
        gsap.set('#contact', { zIndex: 60 });
        gsap.set('#f1-footer', { zIndex: 70 });
        gsap.set('#zakaria-finale-section', { zIndex: 80 });

        // 2. PIN PROJECTS
        const projectsSec = document.getElementById('projects');
        if (projectsSec) {
            ScrollTrigger.create({
                trigger: projectsSec,
                start: 'bottom bottom',   // Pin when bottom of Projects touches bottom of Window
                end: () => "max",         // Unpin never
                pin: true,
                pinSpacing: false,        // The magic property so the next items glide over
            });

            // Gentle darkening of the projects section as it gets covered
            gsap.to(projectsSec, {
                scale: 0.95,
                opacity: 0.3,
                ease: "none",
                scrollTrigger: {
                    trigger: projectsSec,
                    start: "bottom bottom",
                    end: () => "+=" + window.innerHeight * 1.5,
                    scrub: true
                }
            });
        }

        // Note: The signature section is pinned natively in its own GSAP timeline above
        // to control the explicit delay before the next sections scroll into view.

        // 3. PIN CONTACT SECTION
        const contactSec = document.getElementById('contact');
        if (contactSec) {
            ScrollTrigger.create({
                trigger: contactSec,
                start: 'top top',         // Pin when top of contact touches top of Window
                end: () => "max",
                pin: true,
                pinSpacing: false,
            });

            // Gentle darkening of the contact section as the next sections glide over
            gsap.to(contactSec, {
                scale: 0.95,
                opacity: 0.3,
                ease: "none",
                scrollTrigger: {
                    trigger: contactSec,
                    start: "top top",
                    end: () => "+=" + window.innerHeight * 1.5,
                    scrub: true
                }
            });
        }
    }

} // ← END CLASS

document.addEventListener('DOMContentLoaded', () => {
    const anims = new AdvancedAnimations();
    anims.initAboutReveal();
    anims.initExpertiseShuffle();
    anims.initSignatureAnimation();
    anims.initPinnedOverlapEffects();
});
