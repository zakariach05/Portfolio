// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    // --- Theme Toggling Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
    const html = document.documentElement;

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
        anime({
            targets: [themeToggleBtn, mobileThemeToggleBtn],
            rotate: '1turn',
            duration: 800,
            easing: 'easeInOutSine'
        });
    }

    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', toggleTheme);


    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuBtn.querySelector('i');

            // Simple icon swap
            if (mobileMenu.classList.contains('hidden')) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            } else {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');

                // Anime.js entrance for menu items when opening
                anime({
                    targets: '.mobile-link',
                    translateX: [-50, 0],
                    opacity: [0, 1],
                    delay: anime.stagger(100),
                    easing: 'easeOutQuad'
                });
            }
        });
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('shadow-lg');
                // Check if dark mode is active to apply correct background
                if (html.classList.contains('dark')) {
                    navbar.classList.add('bg-slate-900/95');
                    navbar.classList.remove('bg-white/90');
                } else {
                    navbar.classList.add('bg-white/95');
                    navbar.classList.remove('bg-slate-900/90');
                }
            } else {
                navbar.classList.remove('shadow-lg');
                navbar.classList.remove('bg-slate-900/95');
                navbar.classList.remove('bg-white/95');
            }
        });
    }


    // --- GSAP Animations ---

    if (document.querySelector('.hero-content h1')) {
        const tl = gsap.timeline();
        tl.from('.hero-content h1', {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        })
            .from('.hero-content h2', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.5")
            .from('.hero-content p', {
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.5")
            .from('.hero-content div a', {
                y: 20,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.5");
    }

    // --- Navbar Brand Animation (ZC.) ---
    const brandLogo = document.querySelector('nav a.text-2xl');
    if (brandLogo) {
        // Initial entrance
        anime({
            targets: brandLogo,
            translateY: [-20, 0],
            opacity: [0, 1],
            duration: 1000,
            delay: 200,
            easing: 'easeOutElastic(1, .8)'
        });

        // Hover effect
        brandLogo.addEventListener('mouseenter', () => {
            anime({
                targets: brandLogo,
                scale: [1, 1.2, 1],
                rotate: '1turn',
                duration: 1000,
                color: ['#2563EB', '#9333EA', '#2563EB'], // Cycle colors
                easing: 'easeInOutSine'
            });
        });
    }

    // --- Greeting Animation (Bonjour 👋 -> Je suis Zakaria) ---
    const greetingElement = document.getElementById('hero-greeting');
    if (greetingElement) {
        // 1. Start with "Bonjour 👋"
        greetingElement.innerHTML = 'Bonjour <span id="wave-emoji" style="display:inline-block">👋</span>';

        // 2. Animate the WaveEmoji
        anime({
            targets: '#wave-emoji',
            rotate: [0, 20, -20, 20, 0],
            duration: 900, // Accelerated from 1500
            easing: 'easeInOutSine',
            loop: 2, // Wave twice
            complete: function () {
                // 3. Wait a bit, then delete
                setTimeout(() => {
                    deleteGreeting();
                }, 200); // Reduced delay from 500
            }
        });

        function deleteGreeting() {
            let text = greetingElement.textContent; // "Bonjour 👋"
            let length = text.length;

            const deleteInterval = setInterval(() => {
                if (length > 0) {
                    // Quick backspace
                    greetingElement.textContent = text.substring(0, length - 1);
                    length--;
                } else {
                    clearInterval(deleteInterval);
                    // 4. Type "Je suis Zakaria Chamekh"
                    setTimeout(() => {
                        typeFinalGreeting("Je suis Zakaria Chamekh 🙋🏻‍♂️");
                    }, 100); // Reduced delay from 300
                }
            }, 30); // Faster delete speed from 50
        }

        function typeFinalGreeting(finalText) {
            let i = 0;
            greetingElement.textContent = ""; // Ensure empty

            const typeInterval = setInterval(() => {
                if (i < finalText.length) {
                    greetingElement.textContent += finalText.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                }
            }, 40); // Faster typing speed from 80
        }
    }

    // --- Typewriter Animation ---
    const typewriterElement = document.getElementById('typewriter');
    if (typewriterElement) {
        const textToType = "Full Stack Junior";
        let charIndex = 0;
        let isDeleting = false;

        function typeWriter() {
            const currentText = textToType;

            if (!isDeleting && charIndex < currentText.length) {
                typewriterElement.textContent += currentText.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 100);
            } else if (isDeleting && charIndex > 0) {
                typewriterElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                setTimeout(typeWriter, 50);
            } else {
                isDeleting = !isDeleting;
                setTimeout(typeWriter, isDeleting ? 2000 : 500);
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
    const sections = ['#about', '#skills', '#experience', '#projects', '#contact'];

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

    // --- Form Handling (PHP Link) ---
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalBtnText = btn.innerHTML;

            // UI Button feedback
            anime({
                targets: btn,
                scale: [1, 0.95, 1],
                duration: 300,
                easing: 'easeInOutQuad'
            });

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
            btn.disabled = true;

            const formData = new FormData(form);

            // Helper function to animate success message
            const showSuccess = (msg, colorClass = "text-green-500") => {
                formStatus.textContent = msg;
                formStatus.className = `text-sm text-center mt-4 ${colorClass} font-medium`;
                formStatus.classList.remove('hidden');
                form.reset();

                anime({
                    targets: formStatus,
                    translateY: [10, 0],
                    opacity: [0, 1],
                    duration: 500
                });

                // Hide after 6 seconds
                setTimeout(() => {
                    anime({
                        targets: formStatus,
                        opacity: 0,
                        duration: 500,
                        complete: function () {
                            formStatus.classList.add('hidden');
                            formStatus.style.opacity = 1;
                        }
                    });
                }, 6000);
            };

            // Force wait for realism
            await new Promise(resolve => setTimeout(resolve, 1000));

            try {
                // 1. Try to send to PHP
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData
                });

                // 2. Check if we got a valid response
                if (response.ok) {
                    const text = await response.text();
                    // Sometimes servers return the PHP code itself if PHP is not enabled
                    if (text.includes('<?php') || text.includes('Accès interdit')) {
                        throw new Error("PHP non exécuté");
                    }
                    showSuccess(text || "Message envoyé avec succès !");
                } else {
                    // Check for 405 Method Not Allowed (common on static servers)
                    if (response.status === 405) {
                        throw new Error("Serveur statique détecté");
                    }
                    throw new Error("Erreur serveur " + response.status);
                }
            } catch (error) {
                console.warn("Contact form fallback triggered:", error);

                // FALLBACK SUCCESS MODE
                // Since this is likely a portfolio demo without a real backend setup yet,
                // we want to give the user a positive experience rather than a broken error.

                let fallbackMessage = "Message simulé (Mode Démo) !";

                if (window.location.protocol === 'file:') {
                    fallbackMessage = "Mode Démo : Message simulé (Fichier local)";
                } else {
                    fallbackMessage = "Message envoyé ! (Simulation car serveur PHP absent)";
                }

                showSuccess(fallbackMessage, "text-amber-500");

            } finally {
                btn.innerHTML = originalBtnText;
                btn.disabled = false;
            }
        });
    }

});
