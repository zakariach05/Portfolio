/**
 * scroll-manager.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Système centralisé de gestion du scroll et de la navigation.
 * Remplacé par une navigation naturelle fluide : aucun scroll-hijacking !
 *
 * Fonctionnalités :
 *  1. Détection de section active via IntersectionObserver
 *  2. Navigation Dots cliquables
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── CONFIG ───────────────────────────────────────────────────────────────────
const SECTIONS = ['#home', '#about', '#expertise', '#projects', '#contact', '#f1-footer', '#zakaria-finale-section'];
const OBSERVER_THRESH = 0.2; // Threshold for active section detection

// ── ÉTAT GLOBAL ─────────────────────────────────────────────────────────────
let activeIndex = 0;

// ── UTILITAIRES ──────────────────────────────────────────────────────────────
const getSection = (i) => document.querySelector(SECTIONS[i]);

/**
 * Navigue vers la section à l'index `targetIndex`.
 */
function navigateTo(targetIndex) {
    if (targetIndex < 0 || targetIndex >= SECTIONS.length) return;

    const target = getSection(targetIndex);
    if (!target) return;

    // Scroll via Lenis (smooth) ou natif
    if (window.lenis) {
        window.lenis.scrollTo(target, {
            offset: 0,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
    } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ── NAVIGATION DOTS ──────────────────────────────────────────────────────────
function createNavigationDots() {
    if (document.getElementById('nav-dots-container')) return;

    const container = document.createElement('div');
    container.id = 'nav-dots-container';
    container.style.cssText = `
        position: fixed;
        right: 24px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: auto;
    `;

    SECTIONS.forEach((sec, i) => {
        // Ignorer le bloc complet si on ne veut pas l'afficher dans les dots, mais ici on le montre pour faciliter.
        const dot = document.createElement('button');
        dot.className = 'nav-dot';
        dot.setAttribute('aria-label', `Aller à la section ${sec.replace('#', '')}`);
        dot.dataset.index = i;
        dot.style.cssText = `
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255,255,255,0.3);
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 0;
        `;
        dot.addEventListener('click', () => navigateTo(i));
        container.appendChild(dot);
    });

    document.body.appendChild(container);
    updateActiveDot(0);
}

function updateActiveDot(index) {
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
        if (i === index) {
            dot.style.background = '#DC2626';
            dot.style.width = '10px';
            dot.style.height = '10px';
            dot.style.boxShadow = '0 0 8px rgba(220,38,38,0.6)';
        } else {
            dot.style.background = 'rgba(255,255,255,0.3)';
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.boxShadow = 'none';
        }
    });
}

// ── INTERSECTION OBSERVER ────────────────────────────────────────────────────
function initSectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const idx = SECTIONS.indexOf('#' + entry.target.id);
                if (idx !== -1) {
                    activeIndex = idx;
                    updateActiveDot(idx);
                    // Signale aux scènes 3D quelle section est active
                    window.dispatchEvent(new CustomEvent('sectionChange', { detail: { index: idx, id: entry.target.id } }));
                }
            }
        });
    }, { threshold: OBSERVER_THRESH });

    SECTIONS.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) observer.observe(el);
    });
}

// ── INITIALISATION ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    createNavigationDots();
    initSectionObserver();

    // Expose globalement
    window.siteNavigateTo = navigateTo;
    window.getSiteActiveIndex = () => activeIndex;
});
