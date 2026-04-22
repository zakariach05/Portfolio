/**
 * hero-scroll-reveal.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cinematic RED hero — GSAP + ScrollTrigger scroll orchestration.
 *
 * Drives portrait position/rotation/glow via window.heroPortrait API
 * (implemented in hero-3d.js) and reveals the HTML text panel on the left.
 *
 * Camera: PerspectiveCamera FOV=42°, z=14
 * At z=0: half-width  ≈ 9.8  (16:9)
 *         half-height ≈ 5.37
 *
 * Timeline (progress 0 → 1):
 *   Phase 1  0.00 → 0.25   Centred · scale up · glow blazes red
 *   Phase 2  0.25 → 0.62   Portrait glides right · Y-rotation · depth
 *   Phase 3  0.62 → 1.00   Text slides in from left · stabilise
 */

(function () {
  'use strict';

  // ── Three.js coordinate targets ──────────────────────────────────────────
  const TARGET_X_RIGHT  =  0;   // Keep centered
  const TARGET_RY_MID   =  0;   // No rotation
  const TARGET_RY_FINAL =  0;   // Keep facing viewer

  // ── Red flash overlay (cinematic phase wipe) ─────────────────────────────
  function createFlashOverlay() {
    const el = document.createElement('div');
    el.id = 'hero-flash-placeholder';
    return el;
  }

  function initHeroReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[HeroReveal] GSAP / ScrollTrigger unavailable.');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // ── Element refs ────────────────────────────────────────────────────────
    const heroSection  = document.getElementById('home');
    const heroSticky   = document.getElementById('hero-sticky');
    const textPanel    = document.getElementById('hero-text-panel');
    const imgWrapper   = document.getElementById('hero-img-wrapper');
    const scrollHint   = document.getElementById('hero-scroll-indicator');
    
    if (!heroSection || !textPanel || !imgWrapper) {
      console.warn('[HeroReveal] Required elements not found.');
      return;
    }

    // ── Initial States ──────────────────────────────────────────────────────
    const isMobile = window.innerWidth <= 900;

    // Portrait centered, slightly smaller, hidden
    if (!isMobile) {
        gsap.set(imgWrapper, { 
            xPercent: -50, 
            yPercent: -50, 
            left: '50%', 
            top: '55%', 
            scale: 0.9,
            opacity: 0,
            filter: 'blur(10px)'
        });
        gsap.set(textPanel, { x: -60, opacity: 0, pointerEvents: 'none' });
    } else {
        // Mobile initial state: Image on top, Text below
        gsap.set(imgWrapper, { 
            xPercent: 0, 
            yPercent: 0, 
            left: 'auto', 
            top: 'auto',
            y: -20, // Start slightly higher
            position: 'relative',
            scale: 0.85,
            opacity: 0,
            filter: 'blur(5px)'
        });
        gsap.set(textPanel, { 
            x: 0, 
            y: 60, // Start lower
            left: 'auto', 
            top: 'auto',
            position: 'relative',
            opacity: 0, 
            pointerEvents: 'none' 
        });
    }
    
    gsap.set(scrollHint, { opacity: 0 });

    // ── Entrance Animation (on load) ────────────────────────────────────────
    const entranceTl = gsap.timeline({ 
        delay: 1.0, 
        onComplete: () => ScrollTrigger.refresh()
    });
    
    entranceTl.to(imgWrapper, { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        filter: 'blur(0px)',
        duration: 1.8, 
        ease: 'expo.out' 
    })
    .to(scrollHint, { 
        opacity: 1, 
        duration: 0.8, 
        ease: 'power2.out' 
    }, '-=0.8');

    // ── Scroll Animation (Center to Right Reveal) ───────────────────────────
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: heroSection,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
            invalidateOnRefresh: true
        }
    });

    if (!isMobile) {
        // Desktop: Glide to the right
        tl.to(imgWrapper, {
            left: '75%', 
            scale: 1.05,
            duration: 1,
            ease: 'power2.inOut'
        }, 0);

        tl.to(textPanel, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            onStart: () => gsap.set(textPanel, { pointerEvents: 'auto' })
        }, 0.2);
    } else {
        // Mobile: Vertical SWAP on scroll (more subtle)
        // Image goes DOWN slightly, Text goes UP
        tl.to(imgWrapper, {
            y: 80, // Reduced movement (was 280)
            scale: 0.95,
            opacity: 0.8, 
            duration: 1,
            ease: 'power2.inOut'
        }, 0);

        tl.to(textPanel, {
            opacity: 1,
            y: -180, // Still moves up enough to clear the image or overlap nicely
            duration: 1,
            ease: 'power2.inOut',
            onStart: () => gsap.set(textPanel, { pointerEvents: 'auto' })
        }, 0.1);
    }

    // 3. Hint fade
    tl.to(scrollHint, { opacity: 0, y: 30, duration: 0.3 }, 0);

    // ── Mouse Interactive Parallax ──────────────────────────────────────────
    document.addEventListener('mousemove', (e) => {
        if (isMobile) return; 
        
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;

        // Portrait 3D tilt
        gsap.to(imgWrapper, {
            rotationY: x * 8,
            rotationX: -y * 8,
            x: x * 30,
            y: y * 30,
            duration: 1.5,
            ease: 'power2.out',
            overwrite: 'auto'
        });

        // Panel subtle drift
        gsap.to(textPanel, {
            x: x * 20,
            y: y * 15,
            duration: 2,
            ease: 'power2.out',
            overwrite: 'auto'
        });
    });

    window.addEventListener('resize', () => ScrollTrigger.refresh());
  }

  // ── Boot ────────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroReveal);
  } else {
    setTimeout(initHeroReveal, 150);
  }

})();
