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

    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', toggleTheme);


    // --- Mobile Menu Toggle (Removed: Links now always visible) ---
    // --- Navbar Scroll Effect (Removed: Navbar is now part of the header and scrolls with the page) ---


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
    const brandLogo = document.querySelector('header a.group');
    const logo05 = document.getElementById('logo-05');

    if (brandLogo && logo05) {
        // Initial entrance for ZC.
        anime({
            targets: 'header a.group span:first-child',
            translateY: [-20, 0],
            opacity: [0, 1],
            duration: 1000,
            delay: 200,
            easing: 'easeOutElastic(1, .8)',
            complete: function () {
                // Start typing "05" after "ZC." appears
                typeLogo05();
            }
        });

        function typeLogo05() {
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
                // 1. Send to local PHP script
                const response = await fetch('./php/contact.php', {
                    method: 'POST',
                    body: formData
                });

                // Get raw text first to debug if JSON parsing fails
                const responseText = await response.text();
                let result;

                try {
                    result = JSON.parse(responseText);
                } catch (e) {
                    console.error("Réponse serveur non-JSON:", responseText);
                    // Check if the response contains the success message despite warnings
                    if (responseText.includes("enregistré avec succès")) {
                        showSuccess("Message enregistré ! (Note: Des avertissements PHP sont apparus, voir console)");
                        return; // Stop here, success handled
                    }
                    throw new Error("Le serveur a renvoyé une réponse invalide. Vérifiez messages.txt ou la console.");
                }

                // 2. Check if we got a valid response
                if (response.ok) {
                    showSuccess(result.message || "Message envoyé avec succès !");
                } else {
                    if (response.status === 422 || response.status === 400) {
                        // Erreurs de validation
                        let errorDetails = result.message || "Veuillez vérifier vos entrées.";
                        throw new Error(errorDetails);
                    }
                    throw new Error(result.message || "Erreur serveur " + response.status);
                }
            } catch (error) {
                console.error("Erreur d'envoi:", error);

                let displayMessage = error.message;

                if (window.location.protocol === 'file:') {
                    displayMessage = "Erreur : Impossible d'utiliser PHP via le protocole file://. Utilisez un serveur local (localhost).";
                } else if (error.message.includes("Unexpected token")) {
                    displayMessage = "Erreur technique : Réponse du serveur invalide (JSON malformé).";
                }

                // Show error message
                formStatus.textContent = displayMessage;
                formStatus.className = "text-sm text-center mt-4 text-red-500 font-medium";
                formStatus.classList.remove('hidden');
                formStatus.style.opacity = 1;

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

            } finally {
                btn.innerHTML = originalBtnText;
                btn.disabled = false;
            }
        });
    }

    // --- Scroll to Top Visibility ---
    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        });
    }

});
