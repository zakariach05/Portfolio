// Advanced Animations (Marquee, 3D Grid, etc.)
class AdvancedAnimations {
    constructor() {
        this.initMarquee();
        this.initProjectsGrid();
    }

    initMarquee() {
        // Only if GSAP is available
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

            // duplicate elements for infinite scroll seamlessly
            const html = el.innerHTML;
            el.innerHTML += html; // Add another set

            // The tween: move to end, then repeat
            const width = el.scrollWidth / 2; // half because we duplicated

            // Initial set
            gsap.set(el, { x: m.direction === -1 ? 0 : -width });

            const tween = gsap.to(el, {
                x: m.direction === -1 ? -width : 0,
                duration: m.duration,
                ease: "none",
                repeat: -1,
                modifiers: {
                    x: gsap.utils.unitize(x => parseFloat(x) % width)
                }
            });

            this.marqueeTweens.push({ tween, baseTimeScale: 1 });

            // Hover to pause logic on words
            const words = el.querySelectorAll('.marquee-word');
            words.forEach(word => {
                word.addEventListener('mouseenter', () => {
                    gsap.to(tween, { timeScale: 0.1, duration: 0.5 });
                });
                word.addEventListener('mouseleave', () => {
                    gsap.to(tween, { timeScale: 1, duration: 0.5 });
                });
            });
        });

        // Speed up on scroll
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.create({
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                onUpdate: (self) => {
                    const velocity = Math.abs(self.getVelocity()); // Velocity 
                    const speedMap = 1 + (velocity / 1000); // Bump timescale based on scroll speed

                    this.marqueeTweens.forEach(({ tween }) => {
                        // Max out at 5x speed
                        const targetScale = Math.min(speedMap, 5);
                        gsap.to(tween, {
                            timeScale: targetScale,
                            duration: 0.2, // quick reaction
                            onComplete: () => {
                                // smooth return back
                                gsap.to(tween, { timeScale: 1, duration: 1 });
                            }
                        });
                    });
                }
            });
        }
    }

    initProjectsGrid() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        const cards = document.querySelectorAll('.project-card-wrapper');
        if (!cards.length) return;

        cards.forEach((card, index) => {
            // Entrance animation
            gsap.fromTo(card,
                { y: 100, opacity: 0, scale: 0.95 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                }
            );

            // Subtile Parallax while scrolling
            const innerCard = card.querySelector('.project-card-3d');
            if (innerCard) {
                gsap.to(innerCard, {
                    y: "-10%",
                    ease: "none",
                    scrollTrigger: {
                        trigger: card,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                });

                // 3D hover effect (tilt)
                innerCard.addEventListener('mousemove', (e) => {
                    const rect = innerCard.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const xPct = x / rect.width - 0.5; // -0.5 to 0.5
                    const yPct = y / rect.height - 0.5;

                    gsap.to(innerCard, {
                        rotateY: xPct * 10,
                        rotateX: -yPct * 10,
                        scale: 1.03,
                        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
                        duration: 0.4,
                        ease: "power2.out"
                    });
                });

                innerCard.addEventListener('mouseleave', () => {
                    gsap.to(innerCard, {
                        rotateY: 0,
                        rotateX: 0,
                        scale: 1,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        duration: 0.5,
                        ease: "power2.out"
                    });
                });
            }
        });
    }

    initAboutReveal() {
        if (!window.gsap || !window.ScrollTrigger) return;

        // Massive Type Scroll Animation
        const reveals = document.querySelectorAll('.reveal-type');
        reveals.forEach((el) => {
            const container = el.querySelector('.perspective-container');
            const speed = parseFloat(el.getAttribute('data-speed') || 0.1);

            // Entry Animation (Zoom + Rotate + Skew)
            gsap.fromTo(container,
                {
                    rotateX: 45,
                    z: -500,
                    opacity: 0,
                    skewY: 5
                },
                {
                    rotateX: 0,
                    z: 0,
                    opacity: 1,
                    skewY: 0,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 95%",
                        end: "bottom 20%",
                        scrub: 1.5
                    }
                }
            );

            // Subtile mouse follow on the container
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                gsap.to(container, {
                    rotateY: x * 20,
                    rotateX: -y * 20,
                    duration: 0.6,
                    ease: "power2.out"
                });
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(container, {
                    rotateY: 0,
                    rotateX: 0,
                    duration: 1,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const anims = new AdvancedAnimations();
    anims.initAboutReveal();
});
