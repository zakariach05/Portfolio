"use client";

/**
 * Hero3DText — portage fidèle de hero-3d-text.html (Three.js r128 → three r161).
 *
 * Le texte (nom, rôle, boutons) est dessiné dans un canvas 2048×1024 utilisé
 * comme texture d'un plan incliné. Le shader gère :
 *  - le soulèvement des lettres au survol (raycast → UV → gaussienne en Z)
 *  - l'ombre rouge sous le texte au survol
 *  - 3 passes de peinture automatiques (9 s) appliquées uniquement sur l'alpha
 *    du texte, avec un pinceau image qui suit le bord d'attaque.
 *
 * Tout le contenu textuel vient de l'i18n (redessin de la texture au changement
 * de langue). Un seul WebGLRenderer / scène / boucle RAF est créé au montage,
 * et tout est libéré au démontage.
 */
import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import * as THREE from "three";
import { useLenis } from "@/components/providers/LenisProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme, type Theme } from "@/contexts/ThemeContext";
import styles from "./Hero3DText.module.css";

/* ──────────────────────────────────────────────────────────────
   Réglages faciles à modifier
   ────────────────────────────────────────────────────────────── */

/** Durées des passes de peinture (secondes, temps local de l'étape 0–3 s). */
const DURATION = {
  zakaria: 0.9,
  chamekh: 0.9,
  slogan: 1.3,
  buttons: 1.4,
} as const;

/** Boucle complète : 3 étapes de 3 s = 9 s. */
const LOOP_DURATION = 9;
const STEP_DURATION = 3;

/** Disparition de la peinture dans chaque étape. */
const PAINT_FADE_START = 2.2;
const PAINT_FADE_END = 2.7;

/** Taille du pinceau : unités monde par pixel de l'image 297×262. */
const BRUSH_UNIT_PER_PIXEL = 3.6 / 455;

/** Boîtes des textes en coordonnées de texture (xMin, xMax, yMin, yMax). */
const BOX = {
  zakaria: [150, 1900, 20, 340] as const,
  chamekh: [150, 1900, 345, 580] as const,
  slogan: [300, 1750, 570, 710] as const,
  buttons: [374, 1674, 735, 885] as const,
};

/** Lignes du pinceau : [centre Y, demi-hauteur] en pixels de texture. */
const ROW = {
  zakaria: [190, 150] as const,
  chamekh: [470, 105] as const,
  slogan: [640, 60] as const,
  buttons: [810, 65] as const,
};

/** Boutons dessinés dans la texture (rectangles en pixels). */
const BUTTONS = [
  { x: 374, y: 735, w: 620, h: 150, fill: true, target: "#projects" },
  { x: 1054, y: 735, w: 620, h: 150, fill: false, target: "#contact" },
] as const;

/** Passe de peinture : [début, durée, direction, xMin, xMax, centre Y, demi-h]. */
type Phase = readonly [
  start: number,
  duration: number,
  direction: 1 | -1,
  xMin: number,
  xMax: number,
  yCenter: number,
  halfHeight: number,
];

const PHASES: readonly (readonly Phase[])[] = [
  [
    [0, DURATION.zakaria, 1, BOX.zakaria[0], BOX.zakaria[1], ROW.zakaria[0], ROW.zakaria[1]],
    [DURATION.zakaria, DURATION.chamekh, -1, BOX.chamekh[0], BOX.chamekh[1], ROW.chamekh[0], ROW.chamekh[1]],
  ],
  [[0, DURATION.slogan, 1, BOX.slogan[0], BOX.slogan[1], ROW.slogan[0], ROW.slogan[1]]],
  [[0, DURATION.buttons, 1, BOX.buttons[0], BOX.buttons[1], ROW.buttons[0], ROW.buttons[1]]],
];

/** Textures du pinceau réel : rouge, jaune, bleu, puis rouge. */
const BRUSH_FILES = ["/brush-red.png", "/brush-yellow.png", "/brush-blue.png"];
const BRUSH_TEXTURE_INDEX = [0, 1, 2, 0];
const BRUSH_IMAGE_W = 297;
const BRUSH_IMAGE_H = 262;
const BRUSH_ANCHOR_X = 40;
const BRUSH_ANCHOR_Y = 48;

const FONT_FAMILIES = ["Creepster", "Grechen Fuemen", "Architects Daughter"];
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Creepster&family=Grechen+Fuemen&display=swap";
const FONT_LINK_ID = "hero-3d-text-fonts";

const TEXTURE_W = 2048;
const TEXTURE_H = 1024;

/* ── Couleurs de la scène selon le thème ─────────────────────────
   Le canvas reste transparent : seules les lettres changent de couleur. */
type HeroColors = {
  ink: THREE.Color;
  inkHi: THREE.Color;
  yellow: THREE.Color;
};

function heroColors(theme: Theme): HeroColors {
  return theme === "light"
    ? {
        ink: new THREE.Color(0.1, 0.05, 0.06),
        inkHi: new THREE.Color(0, 0, 0),
        yellow: new THREE.Color(0.96, 0.7, 0.04),
      }
    : {
        ink: new THREE.Color(0.96, 0.94, 0.94),
        inkHi: new THREE.Color(1, 1, 1),
        yellow: new THREE.Color(1.0, 0.82, 0.12),
      };
}

/** Reads the theme already applied to <html> by the no-flash head script. */
function domTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

type Labels = {
  role: string;
  projects: string;
  contact: string;
};

/** Easy add of the two pill buttons to the canvas texture. */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Réduit la police si le texte dépasse la largeur donnée (comme la référence). */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  maxSize: number,
  maxWidth: number
) {
  ctx.font = `${maxSize}px ${family}`;
  const measured = ctx.measureText(text).width;
  if (!measured) return maxSize;
  return Math.min(maxSize, (maxSize * maxWidth) / measured);
}

function paintTexture(canvas: HTMLCanvasElement, labels: Labels) {
  canvas.width = TEXTURE_W;
  canvas.height = TEXTURE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, TEXTURE_W, TEXTURE_H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";

  let family = "Creepster, cursive";
  let size = fitFont(ctx, "ZAKARIA", family, 420, 1750);
  ctx.font = `${size}px ${family}`;
  ctx.fillText("ZAKARIA", TEXTURE_W / 2, 190);

  family = '"Grechen Fuemen", cursive';
  size = fitFont(ctx, "CHAMEKH", family, 420, 1750);
  ctx.font = `${size}px ${family}`;
  ctx.fillText("CHAMEKH", TEXTURE_W / 2, 470);

  family = '"Architects Daughter", cursive';
  ctx.font = `120px ${family}`;
  ctx.fillText(labels.role, TEXTURE_W / 2, 640);

  ctx.font = `64px ${family}`;
  ctx.lineWidth = 7;

  BUTTONS.forEach((button, index) => {
    const text = index === 0 ? labels.projects : labels.contact;
    roundRect(ctx, button.x, button.y, button.w, button.h);
    if (button.fill) {
      ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillText(
        text,
        button.x + button.w / 2,
        button.y + button.h / 2 + 4
      );
      ctx.globalCompositeOperation = "source-over";
    } else {
      ctx.stroke();
      ctx.fillText(
        text,
        button.x + button.w / 2,
        button.y + button.h / 2 + 4
      );
    }
  });
}

function buttonAt(uv: THREE.Vector2) {
  const x = uv.x * TEXTURE_W;
  const y = (1 - uv.y) * TEXTURE_H;
  return BUTTONS.find(
    (b) => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h
  );
}

function smoothstep(v: number) {
  const x = Math.max(0, Math.min(1, v));
  return x * x * (3 - 2 * x);
}

/** Attends le chargement de la feuille Google Fonts (avec garde-fou réseau). */
function waitForFontStylesheet(link: HTMLLinkElement) {
  if (link.sheet) return Promise.resolve();
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      link.removeEventListener("load", finish);
      link.removeEventListener("error", finish);
      resolve();
    };
    link.addEventListener("load", finish, { once: true });
    link.addEventListener("error", finish, { once: true });
    // Si le réseau est très lent, on finit par dessiner avec la police de repli.
    window.setTimeout(finish, 2500);
  });
}

export default function Hero3DText() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const lenis = useLenis();

  /** Target colours the uniforms lerp toward when the theme changes. */
  const colorsRef = useRef<HeroColors>(heroColors(domTheme()));
  /** Uniforms exposed so the theme effect can retarget without rebuilding the scene. */
  const uniformsRef = useRef<{
    uInk: { value: THREE.Color };
    uInkHi: { value: THREE.Color };
    uYellow: { value: THREE.Color };
  } | null>(null);

  useEffect(() => {
    // Prefer the theme actually applied to the DOM (the provider adopts it
    // after mount), falling back to the context value.
    colorsRef.current = heroColors(domTheme() || theme);
  }, [theme]);

  const role = t("hero.roleShort");
  const projectsLabel = t("hero.ctaProjects");
  const contactLabel = t("hero.ctaContact");
  const ariaLabel = t("hero.canvasLabel");

  const labelsRef = useRef<Labels>({
    role: "",
    projects: "",
    contact: "",
  });
  const drawRef = useRef<(() => void) | null>(null);
  const lenisRef = useRef(lenis);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  // Met à jour les libellés + redessine la texture quand la langue change.
  useEffect(() => {
    labelsRef.current = {
      role,
      projects: projectsLabel,
      contact: contactLabel,
    };
    drawRef.current?.();
  }, [role, projectsLabel, contactLabel]);

  const navigateTo = useCallback((targetSelector: string) => {
    const target = document.querySelector<HTMLElement>(targetSelector);
    if (!target) return;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset: 0,
        duration: 1.2,
        easing: (value: number) =>
          Math.min(1, 1.001 - Math.pow(2, -10 * value)),
      });
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  const handleHiddenLink = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, selector: string) => {
      event.preventDefault();
      navigateTo(selector);
    },
    [navigateTo]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch (error) {
      console.warn("[Hero3DText] WebGL unavailable:", error);
      return;
    }

    let disposed = false;
    let raf = 0;
    let isVisible = true;
    let lastFrameAt = 0;
    const brushTextures: THREE.Texture[] = [];

    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.z = 9;

    const initialColors = heroColors(domTheme());
    colorsRef.current = initialColors;

    const uniforms = {
      uTex: { value: null as THREE.Texture | null },
      uM: { value: new THREE.Vector2(-9, -9) },
      uK: { value: 0 },
      uStep: { value: 0 },
      uLt: { value: PAINT_FADE_END + 0.05 },
      uFade: { value: new THREE.Vector2(PAINT_FADE_START, PAINT_FADE_END) },
      uInk: { value: initialColors.ink.clone() },
      uInkHi: { value: initialColors.inkHi.clone() },
      uYellow: { value: initialColors.yellow.clone() },
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      vertexShader: `
        varying vec2 vUv;
        varying float vH;
        uniform vec2 uM;
        uniform float uK;

        void main() {
          vUv = uv;
          float d = distance(uv, uM);
          vH = exp(-d * d * 38.) * uK;
          vec3 p = position;
          p.z += vH * 1.4;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying float vH;
        uniform sampler2D uTex;
        uniform float uStep;
        uniform float uLt;
        uniform vec2 uFade;
        uniform vec3 uInk;
        uniform vec3 uInkHi;
        uniform vec3 uYellow;

        vec4 brush(vec2 p, float ls, float dur, float dir, vec4 bx, vec3 col) {
          if (ls < 0. || p.y < bx.z || p.y > bx.w) return vec4(0.);
          float pr = smoothstep(0., 1., min(ls / dur, 1.));
          float e = (dir > 0.
            ? mix(bx.x - 60., bx.y + 60., pr)
            : mix(bx.y + 60., bx.x - 60., pr))
            + sin(p.y * .09) * 26.
            + sin(p.y * .37 + 1.) * 9.;
          float cov = dir > 0. ? step(p.x, e) : step(e, p.x);
          return vec4(col, cov * (1. - smoothstep(uFade.x, uFade.y, uLt)));
        }

        void main() {
          float t = texture2D(uTex, vUv).a;
          float s = texture2D(uTex, vUv + vec2(-.018, .03) * vH * 3.).a;
          vec3 red = vec3(.88, .11, .18);
          vec2 p = vec2(vUv.x * 2048., (1. - vUv.y) * 1024.);
          vec3 c = mix(uInk, uInkHi, vH);
          vec4 b;

          if (uStep < .5) {
            b = brush(p, uLt, ${DURATION.zakaria}, 1., vec4(150., 1900., 20., 340.), vec3(.88, .11, .18));
            c = mix(c, b.rgb, b.a);
            b = brush(p, uLt - ${DURATION.zakaria}, ${DURATION.chamekh}, -1., vec4(150., 1900., 345., 580.), uYellow);
            c = mix(c, b.rgb, b.a);
          } else if (uStep < 1.5) {
            b = brush(p, uLt, ${DURATION.slogan}, 1., vec4(300., 1750., 570., 710.), vec3(.18, .48, 1.));
            c = mix(c, b.rgb, b.a);
          } else {
            b = brush(p, uLt, ${DURATION.buttons}, 1., vec4(374., 1674., 735., 885.), vec3(.88, .11, .18));
            c = mix(c, b.rgb, b.a);
          }

          // La peinture n'apparaît que là où le texte a un alpha > 0.
          float a = max(t, s * clamp(vH * 2.5, 0., 1.) * .9);
          gl_FragColor = vec4(mix(red, c, t), a);
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(8, 4, 96, 48);
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.set(-0.85, 0, 0.42);
    scene.add(plane);

    // ── Pinceau réel (enfant du plan : suit son inclinaison) ──────────────
    const brushGeometry = new THREE.PlaneGeometry(
      BRUSH_IMAGE_W * BRUSH_UNIT_PER_PIXEL,
      BRUSH_IMAGE_H * BRUSH_UNIT_PER_PIXEL
    );
    const brushMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
    });
    const brush = new THREE.Mesh(brushGeometry, brushMaterial);
    brush.renderOrder = 2;
    brush.raycast = () => {};
    plane.add(brush);

    let brushReady = false;
    const brushImages: HTMLImageElement[] = [];

    BRUSH_FILES.forEach((src, index) => {
      const image = new Image();
      brushImages.push(image);
      image.onload = () => {
        if (disposed) return;
        const texture = new THREE.Texture(image);
        texture.needsUpdate = true;
        texture.anisotropy = Math.min(
          8,
          renderer.capabilities.getMaxAnisotropy()
        );
        texture.colorSpace = THREE.SRGBColorSpace;
        brushTextures[index] = texture;

        if (brushTextures.filter(Boolean).length === BRUSH_FILES.length) {
          brushReady = true;
          brushMaterial.map = brushTextures[BRUSH_TEXTURE_INDEX[0]];
          brushMaterial.needsUpdate = true;
        }
      };
      image.src = src;
    });

    // ── Texture du texte ─────────────────────────────────────────────────
    const textCanvas = document.createElement("canvas");
    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.anisotropy = Math.min(
      8,
      renderer.capabilities.getMaxAnisotropy()
    );
    textTexture.colorSpace = THREE.SRGBColorSpace;

    paintTexture(textCanvas, labelsRef.current);
    textTexture.needsUpdate = true;
    uniforms.uTex.value = textTexture;

    drawRef.current = () => {
      if (disposed) return;
      paintTexture(textCanvas, labelsRef.current);
      textTexture.needsUpdate = true;
    };

    // ── Redimensionnement / responsive ───────────────────────────────────
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width <= 768;
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2)
      );
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      // Référence : le plan se réduit sur les viewports étroits.
      const ratio = Math.min(1, width / height / 1.5);
      // Sur mobile, la composition est agrandie pour mieux occuper l'écran
      // tout en conservant le cadrage et le débordement latéral d'origine.
      const scale = isMobile
        ? 0.4 + 0.24 * ratio
        : 0.55 + 0.45 * ratio + 0.1;
      plane.scale.setScalar(scale);
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Survol (uniquement, aucune animation au repos) ───────────────────
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const targetUv = new THREE.Vector2(-9, -9);
    let hovering = false;

    const setNdc = (event: PointerEvent | MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      ndc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
    };

    const onPointerMove = (event: PointerEvent) => {
      setNdc(event);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(plane, false)[0];
      hovering = Boolean(hit?.uv);
      if (hit?.uv) {
        targetUv.copy(hit.uv);
        canvas.style.cursor = buttonAt(hit.uv) ? "pointer" : "default";
      } else {
        canvas.style.cursor = "default";
      }
    };

    const onPointerLeave = () => {
      hovering = false;
      canvas.style.cursor = "default";
    };

    const onClick = (event: MouseEvent) => {
      setNdc(event);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(plane, false)[0];
      if (!hit?.uv) return;
      const button = buttonAt(hit.uv);
      if (button) navigateTo(button.target);
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("click", onClick);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = Boolean(entry?.isIntersecting);
        if (isVisible && !disposed && !raf) {
          raf = window.requestAnimationFrame(frame);
        }
      },
      { threshold: 0 }
    );
    visibilityObserver.observe(canvas);

    // ── Chargement des fonts puis boucle de rendu ────────────────────────
    let fontLink = document.getElementById(
      FONT_LINK_ID
    ) as HTMLLinkElement | null;
    let createdFontLink = false;
    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.id = FONT_LINK_ID;
      fontLink.rel = "stylesheet";
      fontLink.href = FONT_URL;
      document.head.appendChild(fontLink);
      createdFontLink = true;
    }

    const startedAt = performance.now();

    const frame = (now: number) => {
      if (disposed) return;
      if (!isVisible) {
        raf = 0;
        return;
      }
      if (window.innerWidth <= 768 && now - lastFrameAt < 1000 / 45) {
        raf = window.requestAnimationFrame(frame);
        return;
      }
      lastFrameAt = now;
      raf = window.requestAnimationFrame(frame);

      if (!reduceMotion) {
        const total = ((now - startedAt) / 1000) % LOOP_DURATION;
        const step = Math.floor(total / STEP_DURATION);
        const localTime = total - step * STEP_DURATION;
        uniforms.uStep.value = step;
        uniforms.uLt.value = localTime;

        let brushOpacity = 0;
        const phases = PHASES[step] ?? PHASES[0];

        phases.forEach((phase, index) => {
          const [start, duration, direction, xMin, xMax, yCenter, halfHeight] =
            phase;
          const local = localTime - start;

          if (local >= 0 && local <= duration + 0.25) {
            const brushIndex = [0, 2, 3][step] + index;
            const textureIndex = BRUSH_TEXTURE_INDEX[brushIndex] ?? 0;
            if (brushReady && brushMaterial.map !== brushTextures[textureIndex]) {
              brushMaterial.map = brushTextures[textureIndex];
              brushMaterial.needsUpdate = true;
            }

            const progress = smoothstep(Math.min(local / duration, 1));
            const px =
              direction > 0
                ? xMin - 60 + (xMax - xMin + 120) * progress
                : xMax + 60 - (xMax - xMin + 120) * progress;
            const py = yCenter + Math.sin(local * 16) * halfHeight * 0.7;

            brush.position.set(
              (px / TEXTURE_W - 0.5) * 8 -
                (BRUSH_ANCHOR_X - BRUSH_IMAGE_W / 2) * BRUSH_UNIT_PER_PIXEL,
              (0.5 - py / TEXTURE_H) * 4 -
                (BRUSH_IMAGE_H / 2 - BRUSH_ANCHOR_Y) * BRUSH_UNIT_PER_PIXEL,
              0.08
            );
            brush.rotation.z = Math.sin(local * 16) * 0.05;

            brushOpacity =
              local <= duration ? 1 : 1 - (local - duration) / 0.25;
          }
        });

        brushMaterial.opacity = brushReady ? brushOpacity : 0;
      } else {
        // Mouvement réduit : pas de peinture, pas de soulèvement.
        uniforms.uStep.value = 0;
        uniforms.uLt.value = PAINT_FADE_END + 0.05;
        brushMaterial.opacity = 0;
      }

      const wantLift = !reduceMotion && hovering ? 1 : 0;
      uniforms.uM.value.lerp(targetUv, 0.12);
      uniforms.uK.value += (wantLift - uniforms.uK.value) * 0.08;

      // Theme colours ease toward the target (~250 ms at 60 fps). No scene
      // rebuild, no paint-loop restart — only these three uniforms change.
      const targetColors = colorsRef.current;
      const colorLerp = reduceMotion ? 1 : 0.18;
      uniforms.uInk.value.lerp(targetColors.ink, colorLerp);
      uniforms.uInkHi.value.lerp(targetColors.inkHi, colorLerp);
      uniforms.uYellow.value.lerp(targetColors.yellow, colorLerp);

      renderer.render(scene, camera);
    };

    raf = window.requestAnimationFrame(frame);

    // Les polices distantes arrivent après le premier rendu : la texture est
    // redessinée avec les vraies polices dès qu'elles sont disponibles.
    const refreshFonts = async () => {
      await waitForFontStylesheet(fontLink!);
      if (disposed) return;

      try {
        await Promise.all(
          FONT_FAMILIES.map((family) =>
            document.fonts.load(`100px "${family}"`, labelsRef.current.role)
          )
        );
      } catch {
        /* police indisponible : on garde la police de repli */
      }
      if (disposed) return;

      paintTexture(textCanvas, labelsRef.current);
      textTexture.needsUpdate = true;
    };

    refreshFonts();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      visibilityObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("click", onClick);

      drawRef.current = null;
      uniformsRef.current = null;
      if (createdFontLink && fontLink) fontLink.remove();

      plane.remove(brush);
      scene.remove(plane);

      brushMaterial.map = null;
      brushMaterial.dispose();
      brushGeometry.dispose();
      brushTextures.forEach((texture) => texture.dispose());
      brushImages.forEach((image) => {
        image.onload = null;
        image.src = "";
      });

      textTexture.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
    };
  }, [navigateTo]);

  return (
    <div className={styles.visual}>
      <h1 className={styles.srOnly}>Zakaria Chamekh — {role}</h1>

      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label={ariaLabel}
        role="img"
      />

      <div className={styles.srLinks}>
        <a
          className={styles.srLink}
          href="#projects"
          onClick={(event) => handleHiddenLink(event, "#projects")}
        >
          {projectsLabel}
        </a>
        <a
          className={styles.srLink}
          href="#contact"
          onClick={(event) => handleHiddenLink(event, "#contact")}
        >
          {contactLabel}
        </a>
      </div>
    </div>
  );
}
