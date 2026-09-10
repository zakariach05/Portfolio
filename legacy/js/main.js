// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    // --- Theme Toggling Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
    const html = document.documentElement;
    const brandLogo = document.querySelector('header a.group');
    const logo05El = document.getElementById('logo-05');

    // Check for saved user preference, if any
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }

    function toggleTheme() {
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            animateThemeIcon('light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            animateThemeIcon('dark');
        }
    }

    // Anime.js animation for theme icon
    function animateThemeIcon(mode) {
        const targets = [];
        if (themeToggleBtn) targets.push(themeToggleBtn);
        if (mobileThemeToggleBtn) targets.push(mobileThemeToggleBtn);

        if (targets.length > 0) {
            anime({
                targets: targets,
                rotate: '1turn',
                duration: 800,
                easing: 'easeInOutSine'
            });
        }
    }

    // --- Scramble Text Effect ---
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const scrambleElements = document.querySelectorAll(".scramble-text");

    scrambleElements.forEach(element => {
        let interval = null;

        element.onmouseover = event => {
            let iteration = 0;
            const originalValue = element.dataset.value;
            const arrow = element.querySelector('.arrow');
            const arrowContent = arrow ? arrow.outerHTML : '';

            clearInterval(interval);

            interval = setInterval(() => {
                element.innerHTML = originalValue
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return originalValue[index];
                        }
                        return letters[Math.floor(Math.random() * 26)];
                    })
                    .join("") + (arrowContent ? ` ${arrowContent}` : '');

                if (iteration >= originalValue.length) {
                    clearInterval(interval);
                }

                iteration += 1 / 3;
            }, 30);
        };
    });


    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', toggleTheme);


    // --- Mobile Menu Toggle (Removed: Links now always visible) ---
    // --- Navbar Scroll Effect (Removed: Navbar is now part of the header and scrolls with the page) ---


    // --- Lenis Smooth Scroll Setup (Performance Optimized) ---
    // On touch devices use native scroll (no smoothWheel hijack) + shorter duration
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const lenis = new Lenis({
        duration: isCoarsePointer ? 0.8 : 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: !isCoarsePointer,
        smoothTouch: false,
        touchMultiplier: 1.5,
        wheelMultiplier: 1.0,
        infinite: false,
    });

    // Expose lenis globally
    window.lenis = lenis;

    // Advanced Sync for Maximum Smoothness
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Global GSAP Performance Tweaks
    ScrollTrigger.config({ limitCallbacks: true }); // Better for CPU/Memory
    ScrollTrigger.clearScrollMemory('manual'); // Smoother reloads

    // --- Splash Screen Logic ---
    const splashScreen = document.getElementById('splash-screen');
    const splashCounter = document.getElementById('splash-counter');
    const splashV = document.getElementById('splash-v');
    const body = document.body;

    function startHeroAnimations() {
        if (document.querySelector('.hero-content h1')) {
            const tl = gsap.timeline();
            tl.from('.hero-content h1', {
                y: 50,
                opacity: 0,
                duration: 2,
                ease: "power3.out"
            })
                .from('.hero-content h2', {
                    y: 30,
                    opacity: 0,
                    duration: 2,
                    ease: "power3.out"
                }, "-=0.5")
                .from('.hero-content p', {
                    y: 20,
                    opacity: 0,
                    duration: 2,
                    ease: "power3.out"
                }, "-=0.5")
                .from('.hero-content div a', {
                    y: 20,
                    opacity: 0,
                    stagger: 0.2,
                    duration: 2,
                    ease: "power3.out"
                }, "-=0.5");
        }

        // --- Navbar Brand Animation (ZC.) ---
        const brandLogo = document.querySelector('header a.group');
        const logo05 = document.getElementById('logo-05');

        if (brandLogo && logo05) {
            anime({
                targets: 'header a.group span:first-child',
                translateY: [-20, 0],
                opacity: [0, 1],
                duration: 1000,
                delay: 200,
                easing: 'easeOutElastic(1, .8)',
                complete: function () {
                    typeLogo05();
                }
            });
        }

        // Trigger refresh for animations
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);

        initParallax();
        initHeroReveal();
    }

    // --- Hero Load-in Reveal (breakpoint-split: text-split on desktop, fade on mobile) ---
    function initHeroReveal() {
        const panel = document.getElementById('hero-text-panel');
        const nameEl = document.getElementById('hero-name');
        if (!panel || typeof gsap === 'undefined') return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const showPanel = () => {
            gsap.set(panel, { clearProps: 'all' });
            panel.style.opacity = '1';
            panel.style.pointerEvents = 'auto';
        };

        const mm = gsap.matchMedia();

        // Desktop (>768px): split the name into letters with a mask reveal
        mm.add('(min-width: 768px)', () => {
            try {
                const lines = nameEl ? gsap.utils.toArray('.hero-name-line', nameEl) : [];
                if (lines.length === 0) return;

                const originals = lines.map(l => l.textContent);

                const chars = [];
                lines.forEach(line => {
                    const text = line.textContent;
                    line.textContent = '';
                    [...text].forEach(ch => {
                        const s = document.createElement('span');
                        s.textContent = ch;
                        s.style.display = 'inline-block';
                        line.appendChild(s);
                        chars.push(s);
                    });
                });

                // Initial hidden state applied right before the timeline plays
                gsap.set(chars, { yPercent: 115, opacity: 0 });
                gsap.set('#hero-role', { y: 28, opacity: 0 });
                gsap.set('.hero-description', { y: 22, opacity: 0 });
                gsap.set('#hero-cta-group a', { y: 18, opacity: 0 });

                const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
                tl.to(chars, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.04 }, 0.1)
                    .to('#hero-role', { y: 0, opacity: 1, duration: 0.7 }, '-=0.3')
                    .to('.hero-description', { y: 0, opacity: 1, duration: 0.7 }, '-=0.45')
                    .to('#hero-cta-group a', { y: 0, opacity: 1, stagger: 0.12, duration: 0.6 }, '-=0.45')
                    .eventCallback('onComplete', showPanel);

                return () => {
                    lines.forEach((l, i) => { l.textContent = originals[i]; });
                };
            } catch (e) {
                console.warn('[HeroReveal] desktop reveal skipped:', e);
                showPanel();
            }
        });

        // Mobile (<768px): simple fade + translateY, no letter splitting
        mm.add('(max-width: 767px)', () => {
            try {
                gsap.fromTo(panel, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' });
            } catch (e) {
                console.warn('[HeroReveal] mobile reveal skipped:', e);
                showPanel();
            }
        });
    }

    // --- Parallax Effect (desktop only; torn down automatically via matchMedia) ---
    function initParallax() {
        const mm = gsap.matchMedia();
        mm.add('(min-width: 769px)', () => {
            gsap.utils.toArray('.hero-image, .project-card, .skill-card').forEach((el) => {
                gsap.to(el, {
                    yPercent: -10,
                    ease: "none",
                    scrollTrigger: {
                        trigger: el,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                });
            });
        });
    }

    if (splashScreen && splashCounter) {
        // Lock Scroll
        lenis.stop();
        body.style.overflow = 'hidden';

        // Phase 1: Slot Machine Counter (quick spin — whole splash lasts 2s total)
        let startTime = null;
        const duration = 700;

        function updateCounter(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;

            if (progress < duration) {
                // Generate random 4-digit number
                const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                splashCounter.textContent = randomNum;
                requestAnimationFrame(updateCounter);
            } else {
                // End of Phase 1
                splashCounter.textContent = "0005";
                startMorphSequence();
            }
        }
        requestAnimationFrame(updateCounter);

        // Single cleanup path for ending the splash — idempotent & safe
        let splashDone = false;
        const finishSplash = () => {
            if (splashDone) return;
            splashDone = true;

            // Unlock scroll & remove splash FIRST — must always happen
            body.style.overflow = '';
            lenis.start();
            splashV.style.display = 'none';
            splashScreen.style.display = 'none';

            // Force recalculation of page height for ScrollTrigger & Lenis
            ScrollTrigger.refresh();
            lenis.resize();

            // Initial signal to the scroll manager
            window.dispatchEvent(new CustomEvent('sectionChange', { detail: { index: 0, id: 'home' } }));

            // Hero animations must never be able to block the cleanup above
            try {
                startHeroAnimations();
            } catch (e) {
                console.error('startHeroAnimations error:', e);
            }
        };

        // Safety net: never allow the splash to stay up & block the page
        setTimeout(finishSplash, 2300);

        function startMorphSequence() {
            const tl = gsap.timeline();

            // Morph timeline is 1.3s — counter took 0.7s → splash ends at exactly 2s
            tl.to([splashCounter, '#splash-name'], {
                scale: 0, // Shrink 0005 & Name
                opacity: 0,
                duration: 0.35,
                ease: "power2.in"
            }, 0)
                .to(splashV, {
                    opacity: 1,
                    scale: 1, // V appears
                    duration: 0.35,
                    ease: "back.out(1.7)"
                }, 0.15)

                // Phase 3: Move to Top Center (Fixed Position)
                .to(splashV, {
                    y: () => -(window.innerHeight / 2) + 45, // Center in 90px header (approx)
                    scale: 0.3, // Size match
                    color: body.classList.contains('dark') ? '#ffffff' : '#ffffffff', // Optional: match theme? Let's just keep position for now, but maybe sync color if requested later. Keeping styling simple.
                    duration: 0.45,
                    ease: "power3.inOut"
                }, 0.55)

                // Phase 4: Revelation (Background Fade Out + Site Fade In)
                .to(splashScreen, {
                    backgroundColor: "transparent", // Fade out black bg
                    duration: 0.5,
                    ease: "power2.inOut",
                    onStart: () => {
                        splashScreen.style.pointerEvents = 'none'; // Allow clicks on site
                    }
                }, 0.8)
                .to(body, {
                    opacity: 1, // Fade in site content
                    duration: 0.5,
                    ease: "power2.inOut"
                }, 0.8)

                // Final Step: Ensure everything is interactive
                // (no position arg → appended at end of timeline, fires at 1.3s → total = 2s)
                .call(finishSplash);
        }
    } else {
        // Fallback if splash missing
        body.style.opacity = 1;
        body.style.overflow = '';
        lenis.start();
        ScrollTrigger.refresh();
        lenis.resize();
        startHeroAnimations();
    }

    // Debounced resize — coalesces ScrollTrigger.refresh() into one call after resizing stops
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        lenis.resize();
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
    });



    function typeLogo05() {
        const logo05 = document.getElementById('logo-05');
        if (!logo05) return;
        const text = "05";
        let i = 0;
        logo05.textContent = "";

        // Cursor flicker effect
        const cursorInterval = setInterval(() => {
            logo05.classList.toggle('border-transparent');
        }, 400);

        const typingInterval = setInterval(() => {
            if (i < text.length) {
                logo05.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
                // Wait a bit then remove the cursor
                setTimeout(() => {
                    clearInterval(cursorInterval);
                    logo05.classList.remove('border-r-2');
                    logo05.classList.remove('pr-0.5');
                }, 1500);
            }
        }, 300); // Slow typing for "05"
    }

    // Hover effect
    if (brandLogo) {
        brandLogo.addEventListener('mouseenter', () => {
            anime({
                targets: brandLogo,
                scale: [1, 1.05],
                duration: 400,
                easing: 'easeOutQuad'
            });
        });
        brandLogo.addEventListener('mouseleave', () => {
            anime({
                targets: brandLogo,
                scale: 1,
                duration: 400,
                easing: 'easeOutQuad'
            });
        });
    }

    // --- Greeting Animation (REMOVED: Now handled by hero-scroll-reveal.js) ---

    // --- Typewriter Animation ---
    const typewriterElement = document.getElementById('typewriter');
    if (typewriterElement) {
        const words = ["Full Stack Junior", "Développeur PHP"];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeWriter() {
            const currentWord = words[wordIndex];

            if (!isDeleting && charIndex < currentWord.length) {
                typewriterElement.textContent += currentWord.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 100);
            } else if (isDeleting && charIndex > 0) {
                typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                setTimeout(typeWriter, 50);
            } else {
                if (!isDeleting) {
                    isDeleting = true;
                    setTimeout(typeWriter, 2000);
                } else {
                    isDeleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                    setTimeout(typeWriter, 500);
                }
            }
        }
        setTimeout(typeWriter, 1000);
    }

    // --- Perspective Swing Hero Animation ---
    if (document.querySelector('.hero-image')) {
        const heroImageContainer = document.querySelector('.hero-image div');

        // 1. Initial Reveal
        anime({
            targets: heroImageContainer,
            translateY: [50, 0],
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 1500,
            easing: 'easeOutElastic(1, .6)'
        });

        // 2. Continuous Swing Logic
        anime({
            targets: heroImageContainer,
            rotateZ: [-2, 2], // Gentle swing like a pendulum
            translateY: [-10, 10], // Bobbing up and down
            duration: 4000,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine'
        });

        // 3. Interactive 'Squish' on Click
        heroImageContainer.addEventListener('mousedown', () => {
            anime({
                targets: heroImageContainer,
                scaleX: 1.1,
                scaleY: 0.9,
                duration: 100,
                easing: 'easeOutQuad'
            });
        });

        heroImageContainer.addEventListener('mouseup', () => {
            anime({
                targets: heroImageContainer,
                scaleX: 1,
                scaleY: 1,
                duration: 800,
                easing: 'elastic({amplitude: 1, period: 0.5})'
            });
        });
    }

    // --- Footer Name Drawing Animation (SVG) ---
    const footerName = document.querySelector('.footer-name-draw');
    if (footerName) {
        // Trigger drawing when footer comes into view
        const footerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: '.footer-name-draw',
                        strokeDashoffset: [anime.setDashoffset, 0],
                        opacity: [0, 1],
                        easing: 'easeInOutSine',
                        duration: 3000,
                        delay: 500,
                        direction: 'alternate',
                        loop: true, // Draws and undraws
                        endDelay: 1000
                    });

                    // Fill color animation after drawing
                    anime({
                        targets: '.footer-name-draw',
                        fill: ['rgba(0,0,0,0)', '#3B82F6'], // Fills with blue
                        delay: 2500,
                        duration: 1000,
                        easing: 'easeOutExpo',
                        direction: 'alternate',
                        loop: true
                    });

                    footerObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        footerObserver.observe(footerName.closest('div')); // Observe the container
    }

    // --- Generic 3D Fade In for Elements ---
    // Apply this to project cards or other cards
    const cards3D = document.querySelectorAll('.skill-card, .group.relative'); // Select skill and project cards

    if (cards3D.length > 0) {
        // Note: Using Intersection Observer for scroll triggering anime.js
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: entry.target,
                        opacity: [0, 1],
                        translateY: [50, 0],
                        rotateX: [20, 0], // 3D rotation start
                        scale: [0.9, 1],
                        duration: 800,
                        easing: 'easeOutExpo',
                        delay: anime.stagger(100) // If multiple entered at once
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        cards3D.forEach(card => {
            card.style.opacity = '0'; // Hide initially
            observer.observe(card);
        });
    }


    // Scroll Animations for Sections (GSAP)
    const sections = ['#about', '#expertise', '#projects', '#contact'];

    sections.forEach(section => {
        if (document.querySelector(section)) {
            gsap.from(section + ' .container', {
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });
        }
    });

    // Skill Bar Animations (GSAP)
    gsap.utils.toArray('.skill-item').forEach(skill => {
        const progressBar = skill.querySelector('div[style*="width"]');

        if (progressBar) {
            const width = progressBar.style.width;
            progressBar.style.width = '0%';

            gsap.to(progressBar, {
                scrollTrigger: {
                    trigger: skill,
                    start: "top 90%",
                },
                width: width,
                duration: 1.5,
                ease: "power2.out"
            });
        }
    });

    // --- Multi-Step Form Logic ---
    const multiStepForm = document.getElementById('multistep-contact-form');
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.btn-step-next');
    const progressFill = document.getElementById('step-progress');
    const currentStepNum = document.getElementById('current-step-num');
    const successMsg = document.getElementById('form-success-msg');
    let currentStep = 1;

    if (multiStepForm) {
        const updateProgressBar = (step) => {
            const progress = (step / formSteps.length) * 100;
            if (progressFill) progressFill.style.width = `${progress}%`;
            if (currentStepNum) currentStepNum.textContent = step;
        };

        const showStep = (step) => {
            formSteps.forEach(s => s.classList.remove('active'));
            const activeStep = document.querySelector(`.form-step[data-step="${step}"]`);
            if (activeStep) {
                activeStep.classList.add('active');
                const firstInput = activeStep.querySelector('input, textarea');
                if (firstInput) firstInput.focus();
            }
            updateProgressBar(step);
        };

        const validateStep = (step) => {
            const activeStep = document.querySelector(`.form-step[data-step="${step}"]`);
            const inputs = activeStep.querySelectorAll('input, textarea');
            let isValid = true;
            inputs.forEach(input => {
                if (!input.checkValidity()) {
                    isValid = false;
                    input.classList.add('border-red-500');
                    setTimeout(() => input.classList.remove('border-red-500'), 500);
                }
            });
            return isValid;
        };

        nextButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (validateStep(currentStep)) {
                    currentStep++;
                    showStep(currentStep);
                }
            });
        });

        // Handle Enter key
        multiStepForm.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                if (currentStep < formSteps.length) {
                    if (validateStep(currentStep)) {
                        currentStep++;
                        showStep(currentStep);
                    }
                } else if (currentStep === formSteps.length) {
                    multiStepForm.dispatchEvent(new Event('submit'));
                }
            }
        });

        // Final Submission
        multiStepForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validateStep(currentStep)) return;

            const submitBtn = multiStepForm.querySelector('.btn-step-submit');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVOI...';
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append('name', document.getElementById('step-name').value);
            formData.append('email', document.getElementById('step-email').value);
            formData.append('subject', document.getElementById('step-subject').value);
            formData.append('message', document.getElementById('step-message').value);

            try {
                // Simulate server delay for effect
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Using existing contact.php
                const response = await fetch('./php/contact.php', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    multiStepForm.classList.add('hidden');
                    successMsg.classList.remove('hidden');
                    anime({
                        targets: successMsg,
                        opacity: [0, 1],
                        translateY: [20, 0],
                        duration: 800,
                        easing: 'easeOutExpo'
                    });
                } else {
                    throw new Error("Erreur serveur.");
                }
            } catch (err) {
                console.error(err);
                alert("Erreur lors de l'envoi. Veuillez réessayer.");
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }



    // --- Scroll to Top Visibility & Progress (OPTIMISED) ---
    const scrollTopBtn = document.getElementById('scroll-top');
    const progressCircle = document.querySelector('.progress-ring__circle');

    if (scrollTopBtn && progressCircle) {
        const radius = 22;
        const circumference = radius * 2 * Math.PI;
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;

        let scrollTicking = false; // RAF throttle flag

        const updateScrollTop = () => {
            const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.min(Math.max(window.scrollY / scrollTotal, 0), 1);
            const offset = circumference - (scrollPercent * circumference);

            // All DOM mutations INSIDE the RAF — no layout thrashing
            progressCircle.style.strokeDashoffset = offset;

            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }

            if (scrollPercent > 0.99) {
                progressCircle.style.stroke = '#dc2626'; // Red at the end
                progressCircle.style.strokeWidth = '4';
            } else if (scrollPercent > 0.7) {
                progressCircle.style.stroke = '#0077ff';
                progressCircle.style.strokeWidth = '3.5';
            } else {
                progressCircle.style.stroke = '#2402e6';
                progressCircle.style.strokeWidth = '3';
            }

            scrollTicking = false;
        };

        // passive:true — browser can scroll immediately without waiting for handler
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(updateScrollTop);
                scrollTicking = true;
            }
        }, { passive: true });
    }


    // --- Global Scroll Reveal Text Animation (GSAP) ---
    const revealElements = document.querySelectorAll('.scroll-reveal-text');
    revealElements.forEach(el => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 90%",
                end: "bottom 20%",
                scrub: 1.5, // Reduced from 10 — ticker stays active less time
            },
            color: "var(--reveal-target)",
            opacity: 1
        });

        const strongTags = el.querySelectorAll('strong');
        if (strongTags.length > 0) {
            gsap.to(strongTags, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    end: "bottom 20%",
                    scrub: 1.5, // Reduced from 10
                },
                color: "#10b981",
                fontWeight: "700"
            });
        }
    });



    // --- Custom Mouse Cursor Interaction (fine pointers only — skipped on touch) ---
    const cursor = document.querySelector('.custom-cursor');
    const dot = document.querySelector('.cursor-dot');
    const follower = document.querySelector('.cursor-follower');

    if (cursor && dot && follower && window.matchMedia('(pointer: fine)').matches) {
        let mouseX = 0;
        let mouseY = 0;
        let dotX = 0;
        let dotY = 0;
        let followerX = 0;
        let followerY = 0;

        // Easing factors
        const dotEasing = 1;
        const followerEasing = 0.15;

        const moveCursor = (clientX, clientY) => {
            mouseX = clientX;
            mouseY = clientY;
            cursor.style.opacity = '1';
        };

        window.addEventListener('mousemove', (e) => moveCursor(e.clientX, e.clientY));

        // Mobile Touch Support
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                moveCursor(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                moveCursor(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        // Use transform:translate instead of left/top — GPU composited, NO reflow
        function animateCursor() {
            dotX += (mouseX - dotX) * dotEasing;
            dotY += (mouseY - dotY) * dotEasing;
            dot.style.transform = `translate(${dotX}px, ${dotY}px)`;

            followerX += (mouseX - followerX) * followerEasing;
            followerY += (mouseY - followerY) * followerEasing;
            follower.style.transform = `translate(${followerX}px, ${followerY}px)`;

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover Effect using Event Delegation
        const handleHover = (e) => {
            const target = e.target;
            cursor.classList.remove('active-project-view', 'active-link', 'active-text-reveal');

            if (!target) {
                return;
            }

            const projectCard = target.closest('.project-card-3d');
            const link = target.closest('a, button, .nav-link-item, .tech-item');
            const textReveal = target.closest('.hover-reveal'); 

            if (projectCard) {
                cursor.classList.add('active-project-view');
            } else if (textReveal) {
                cursor.classList.add('active-text-reveal');
            } else if (link) {
                cursor.classList.add('active-link');
                
                // Magnetic / Move with mouse effect for links
                const rect = link.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const moveX = (e.clientX - centerX) * 0.3;
                const moveY = (e.clientY - centerY) * 0.3;
                
                gsap.to(link, {
                    x: moveX,
                    y: moveY,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        };

        const resetLinkPosition = (e) => {
            const link = e.target.closest('a, button, .nav-link-item, .tech-item');
            if (link) {
                gsap.to(link, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.3)"
                });
            }
        };

        document.addEventListener('mousemove', (e) => handleHover(e));
        document.addEventListener('mouseout', (e) => {
            handleHover({ target: null });
            resetLinkPosition(e);
        });

        // Touch Interaction for mobile
        document.addEventListener('touchstart', (e) => handleHover(e.target), { passive: true });
        document.addEventListener('touchend', () => setTimeout(() => handleHover(null), 300), { passive: true });

        // Click interaction for project cards (Simplified because they are now <a> tags)
        document.addEventListener('click', (e) => {
            const projectCard = e.target.closest('.project-card-3d');
            if (projectCard && !e.target.closest('a')) {
                // If somehow the click wasn't on the <a> itself but on the wrapper
                const link = projectCard.querySelector('a');
                if (link) link.click();
            }
        });


        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
        });
    }

    // --- Optimized Header Fix Scroll Effect ---
    const mainHeader = document.getElementById('main-header');
    if (mainHeader) {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeader = () => {
            if (window.scrollY > 50) {
                mainHeader.classList.add('bg-white/80', 'dark:bg-black/80', 'backdrop-blur-md', 'py-4', 'shadow-lg');
                mainHeader.classList.remove('py-6');
            } else {
                mainHeader.classList.remove('bg-white/80', 'dark:bg-black/80', 'backdrop-blur-md', 'py-4', 'shadow-lg');
                mainHeader.classList.add('py-6');
            }
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    }

    // --- Optimized Footer F1 Interaction (Parallax) ---
    const footerParallax = document.getElementById('footer-parallax');
    const footerPhoto = footerParallax?.querySelector('.footer-photo');

    if (footerParallax && footerPhoto && window.matchMedia('(pointer: fine)').matches) {
        // Use GSAP quickTo for ultra-smooth mouse following performance
        const xTo = gsap.quickTo(footerPhoto, "x", { duration: 1, ease: "power2.out" });
        const yTo = gsap.quickTo(footerPhoto, "y", { duration: 1, ease: "power2.out" });

        let isFooterInView = false;

        // Only track mouse if footer is in viewport
        const observer = new IntersectionObserver((entries) => {
            isFooterInView = entries[0].isIntersecting;
        }, { threshold: 0.1 });

        observer.observe(footerParallax);

        window.addEventListener('mousemove', (e) => {
            if (!isFooterInView) return;

            const moveX = (e.clientX - window.innerWidth / 2) / 50;
            const moveY = (e.clientY - window.innerHeight / 2) / 50;

            xTo(moveX);
            yTo(moveY);
        }, { passive: true });
    }
});
