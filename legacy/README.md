# 🚀 ZAKARIA CHAMEKH — PREMIUM PORTFOLIO

Bienvenue sur le dépôt officiel de mon portfolio haute performance. Ce projet est une vitrine technologique alliant design immersif, animations fluides et architecture front-end robuste.

---

## 🛠️ Tech Stack & Écosystème

Ce portfolio a été conçu pour offrir une expérience utilisateur (UX) sans compromis sur la performance.

*   **Core** : `HTML5`, `Tailwind CSS`, `JavaScript (ES6+)`
*   **3D Engine** : `Three.js` (Rendu WebGL haute performance)
*   **Motion Architecture** : 
    *   `GSAP` & `ScrollTrigger` pour les animations complexes liées au défilement.
    *   `Anime.js` pour les micro-interactions légères.
*   **Smooth Scroll** : `Lenis` (Scrolling fluide haute précision avec interpolation).
*   **GPU Acceleration** : Utilisation intensive de `will-change` et de l'isolation de calques pour garantir un rendu à **60fps**.

---

## ✨ Fonctionnalités Clés

### 1. Hero 3D Immersif (`js/hero-3d.js`)
Une scène WebGL personnalisée utilisant des shaders de bruit (Noise) et des techniques de découpage d'images dynamique (Slice Animation). Interaction temps réel avec la souris et synchronisation avec le scroll.

### 2. Gestion de Navigation Native (`js/scroll-manager.js`)
Contrairement au "Scroll Hijacking" classique, ce projet utilise les API natives (`IntersectionObserver`) pour suivre la position de l'utilisateur. Cela garantit une accessibilité parfaite et un comportement naturel sur tous les appareils (tactile, souris, trackpad).

### 3. Design Système Premium
Inspiré par l'esthétique "F1" et le minimalisme technique :
*   Effets de glassmorphisme.
*   Typographie typée (Bebas Neue, Oswald).
*   Optimisation des Core Web Vitals pour un chargement instantané.

---

## 🏗️ Structure du Projet

```bash
├── 📁 css/             # Styles principaux & optimisations GPU
├── 📁 js/              # Architecture applicative
│   ├── main.js         # Point d'entrée & Orchestration
│   ├── scroll-manager.js # Suivi des sections & Navigation
│   ├── hero-3d.js      # Scène Three.js du Hero
│   └── advanced-animations.js # Marquee & Effets 3D Grid
├── 📁 NV-IMG/          # Assets optimisés
├── 📁 php/             # Logique Backend (Contact)
└── index.html          # Page principale optimisée SEO
```

---

## 📈 Optimisations Récentes

*   **Stabilisation du Scroll** : Remplacement du blocage d'événements par une approche passive hautement performante.
*   **Performance GPU** : Migration vers `overflow-x: clip` et gestion des calques par `contain: layout`.
*   **Responsive Fix** : Adaptation dynamique de la scène Three.js et des hauteurs `h-screen` en `min-h-screen`.

---

© 2025 **ZAKARIA CHAMEKH**. All rights reserved. 
*Always delivering the code.*
