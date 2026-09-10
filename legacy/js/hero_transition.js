
// --- Hero Image Transition to About Section ---
// Implements the request: "transition de image de hero en left en page abouut"

document.addEventListener('DOMContentLoaded', () => {
    // Wait for layout to stabilize
    setTimeout(() => {
        // Only on Desktop
        if (window.innerWidth > 1024) {
            initHeroTransition();
        }
    }, 500);
});

function initHeroTransition() {
    gsap.registerPlugin(ScrollTrigger);

    const homeSection = document.getElementById('home');
    const scanContainer = document.querySelector('.scan-container');
    const heroImgContainer = scanContainer ? scanContainer.parentElement : document.getElementById('hero-img-wrapper');
    const aboutSection = document.getElementById('about');
    const aboutTargetImg = document.getElementById('about-final-img');

    if (!homeSection || !heroImgContainer || !aboutSection) return;

    // Critical: Remove overflow hidden from Home so the image can escape
    homeSection.classList.remove('overflow-hidden');

    // We want the image to be visible in the About section.
    // The About section has z-index. Home has z-index.
    // Ensure the image container has high Z-index.
    heroImgContainer.style.zIndex = "50";
    heroImgContainer.style.position = "relative";

    // Calculate movement
    // We want to move from [Hero Position] to [About Position]
    // Since we are using standard flow, we can use a relative movement.

    gsap.to(heroImgContainer, {
        scrollTrigger: {
            trigger: "#home",
            start: "top top",
            endTrigger: "#about",
            end: "center center",
            scrub: 1, // Smooth linkage to scroll
        },
        // Move towards the left
        x: () => {
            // Move left by approx 45% of screen width to create more space
            return -window.innerWidth * 0.45;
        },
        // Move down to stay in view as we scroll (Parallax effect)
        // Since the page scrolls up, we need to add Y to the image to keep it in the viewport relative to the document
        y: () => {
            // Recalculate positions dynamically
            const homeRect = homeSection.getBoundingClientRect();
            // We want absolute offset relative to document top, effectively:
            const homeTop = window.scrollY + homeRect.top;

            const aboutRect = aboutSection.getBoundingClientRect();
            const aboutTop = window.scrollY + aboutRect.top;

            // Center to Center
            const homeCenter = homeTop + (homeSection.offsetHeight / 2);
            const aboutCenter = aboutTop + (aboutSection.offsetHeight / 2);

            // We need to move DOWN so positive delta
            const delta = aboutCenter - homeCenter;
            return delta;
        },
        scale: 0.85, // Slightly smaller to avoid overlap
        rotation: 3, // Slight tilt to match style
        borderRadius: "20px", // Match about style
        ease: "power1.inOut" // Smoother easing than none
    });

}
