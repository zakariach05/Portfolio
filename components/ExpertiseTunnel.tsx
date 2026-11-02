"use client";

/**
 * ExpertiseTunnel — « Tunnel Fold Slider » WebGL (three.js).
 *
 * Les cartes photo (/public/NV-IMG/Domaine-Dexpe/) sont plaquées sur une
 * ellipse : la caméra est à l'intérieur et regarde le fond du tunnel. Les
 * cartes du centre sont petites et font face à la caméra, celles des bords
 * grandissent et sont vues de biais (trapèzes) → bande en sablier.
 *
 * - Défilement continu + inertie (drag, molette horizontale, flèches).
 * - Pli « porte » amorti par ressort critique, étirement de sortie + frange
 *   chromatique + haze teinté par l'accent (ShaderMaterial).
 * - Photos identiques en FR/EN ; seuls les accents changent avec le thème.
 * - Pause hors écran / onglet caché, prefers-reduced-motion, DPR plafonné.
 * - Fallback grille statique si WebGL ou textures indisponibles.
 */

import { useEffect, useRef, useState } from "react";
import type * as Three from "three";

export type ExpertiseDomain = { title: string; subtitle: string };

export type ExpertiseTunnelLabels = {
  /** Nom accessible de la zone (carousel). */
  region: string;
};

type Props = {
  domains: ExpertiseDomain[];
  labels: ExpertiseTunnelLabels;
};

type Theme = "dark" | "light";

/** Seul endroit à toucher pour régler le tunnel. */
export const TUNNEL_CONFIG = {
  /** Nombre d'instances réparties sur l'ellipse (desktop) — une par domaine. */
  cardCount: 8,
  /** Cartes visibles sur mobile (moins de draw calls) — une par domaine. */
  mobileCardCount: 8,
  /** Taille max d'une carte (unités scène). Réduite si l'arc est trop court. */
  cardSize: 0.72,
  /** Espace visé entre deux cartes le long de l'arc. */
  spacing: 0.05,
  fov: 70,
  /** Demi-axes de l'ellipse. */
  ellipseA: 1.0,
  ellipseB: 1.7,
  /** Position caméra sur Z, en multiple de ellipseB. */
  cameraZ: 0.36,
  /** Vitesse de croisière (rad/s). 0 = figé. */
  speed: 0.055,
  /** Angle de pli max (rad) + raideur du ressort critique. */
  fold: 0.55,
  foldSpring: 7,
  /** Intensité de l'étirement de sortie (facteur du shader). */
  exitStretch: 10,
  /** Décalage chromatique (UV). */
  fringe: 0.012,
  /** Haze teinté par l'accent de la carte. */
  haze: 0.3,
  /** Sensibilité drag (rad/px) et molette (rad/px). */
  dragStrength: 0.0022,
  wheelStrength: 0.0016,
  /** Inertie. */
  maxVelocity: 2.6,
  damping: 2.2,
  dprMax: 2,
  dprMaxMobile: 1.5,
  /** Résolution max des textures photo (mémoire GPU). */
  textureMaxSize: 1024,
  textureMaxSizeMobile: 768,
  /** Coupe le rendu quand la section n'est pas visible. */
  pauseOffscreen: true,
} as const;

/**
 * Photos des cartes — un fichier par domaine (dans l'ordre de `domains`).
 * QA & Tests n'a pas de visuel dédié dans le dossier : elle réutilise la
 * carte générique.
 * Pour changer une image, modifier uniquement cette liste.
 */
const CARD_PHOTOS = [
  "/NV-IMG/Domaine-Dexpe/Front-end_developer_service_card_7428f50f_2K.jpg",
  "/NV-IMG/Domaine-Dexpe/Developer_portfolio_backend_serv_80874584_2K.jpg",
  "/NV-IMG/Domaine-Dexpe/UI_UX_design_portfolio_card_a4fb98f5_2K.jpg",
  "/NV-IMG/Domaine-Dexpe/Developer_portfolio_service_card_a692480f_2K.jpg",
  "/NV-IMG/Domaine-Dexpe/Cloud_and_DevOps_service_card_278649ec_2K.jpg",
  "/NV-IMG/Domaine-Dexpe/Web_security_portfolio_card_f7811f33_2K.jpg",
  "/NV-IMG/Domaine-Dexpe/SEO_and_performance_service_card_a10e0dda_2K.jpg",
] as const;

const ACCENTS: Array<{ dark: string; light: string }> = [
  { dark: "#ef4444", light: "#e11d2e" },
  { dark: "#0a84ff", light: "#0a6cf0" },
  { dark: "#ff8a00", light: "#f06a00" },
  { dark: "#19e68c", light: "#0aa866" },
  { dark: "#8b6bff", light: "#6a45f0" },
  { dark: "#f43f5e", light: "#d6173c" },
  { dark: "#facc15", light: "#d19a00" },
  { dark: "#22d3ee", light: "#0891b2" },
];

/* ── Shaders ─────────────────────────────────────────────────────────────── */

const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D uMap;
uniform float uExit;
uniform float uStretch;
uniform float uFringe;
uniform float uHaze;
uniform vec3 uAccent;
uniform float uOpacity;
varying vec2 vUv;

vec4 card(vec2 uv) {
  return texture2D(uMap, uv);
}

void main() {
  // Smear horizontal : plus la carte sort, plus on moyenne large.
  float spread = uExit * uStretch * 0.045;
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  for (int i = 0; i < 7; i++) {
    float f = float(i) / 6.0 - 0.5;
    vec2 uv = vUv + vec2(f * spread, 0.0);
    vec4 s = card(clamp(uv, vec2(0.001), vec2(0.999)));
    col += s.rgb * s.a;
    alpha += s.a;
  }
  col /= max(alpha, 1e-4);
  alpha /= 7.0;

  // Frange spectrale sur les bords (R vers l'extérieur, B vers l'intérieur).
  vec2 chroma = vec2(uFringe * uExit, 0.0);
  float r = card(clamp(vUv + chroma, vec2(0.001), vec2(0.999))).r;
  float b = card(clamp(vUv - chroma, vec2(0.001), vec2(0.999))).b;
  float mixChroma = clamp(uExit * 1.6, 0.0, 1.0);
  col.r = mix(col.r, r, mixChroma);
  col.b = mix(col.b, b, mixChroma);

  // Haze teinté par l'accent, uniquement en sortie.
  float edge = smoothstep(0.35, 1.0, abs(vUv.x - 0.5) * 2.0);
  col = mix(col, uAccent, edge * uExit * uHaze);
  alpha += edge * uExit * 0.06;

  gl_FragColor = vec4(col, alpha * uOpacity);
  if (gl_FragColor.a < 0.02) discard;

  #include <colorspace_fragment>
}
`;

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function detectTheme(): Theme {
  const root = document.documentElement;
  const attr = root.getAttribute("data-theme") || root.getAttribute("data-bs-theme");
  if (attr === "light" || attr === "dark") return attr;
  if (root.classList.contains("light")) return "light";
  if (root.classList.contains("dark")) return "dark";
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Circonférence approchée (Ramanujan) — sert à répartir les cartes sans overlap. */
function ellipseCircumference(a: number, b: number): number {
  const h = ((a - b) * (a - b)) / ((a + b) * (a + b));
  return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

/** Ramène un angle dans (-π, π]. */
function wrapAngle(t: number): number {
  const twoPi = Math.PI * 2;
  let v = t % twoPi;
  if (v <= -Math.PI) v += twoPi;
  if (v > Math.PI) v -= twoPi;
  return v;
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/* ── Composant ───────────────────────────────────────────────────────────── */

type Api = { setTheme: (theme: Theme) => void };

type CardRef = {
  outer: Three.Group;
  mesh: Three.Mesh;
  material: Three.ShaderMaterial;
  domain: number;
  /** Position de l'instance sur l'ellipse (0..cardCount-1). */
  slot: number;
};

export default function ExpertiseTunnel({ domains, labels }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Api | null>(null);

  const [theme, setTheme] = useState<Theme>("dark");
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");

  const themeRef = useRef<Theme>(theme);
  const domainsRef = useRef(domains);
  themeRef.current = theme;
  domainsRef.current = domains;

  /* Thème courant du site (data-theme, classes .dark/.light, prefers-color-scheme). */
  useEffect(() => {
    const read = () => setTheme(detectTheme());
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-bs-theme"],
    });
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => read();
    mq.addEventListener?.("change", onChange);
    return () => {
      observer.disconnect();
      mq.removeEventListener?.("change", onChange);
    };
  }, []);

  /* Scène three.js — créée une seule fois. */
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    if (!webglAvailable()) {
      setStatus("fallback");
      return;
    }

    let disposed = false;
    let raf = 0;
    let running = true;
    let onScreen = true;
    let dirty = true;

    const reduced = (() => {
      try {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      } catch {
        return false;
      }
    })();
    const isMobile = (() => {
      try {
        return window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
      } catch {
        return false;
      }
    })();

    const config = TUNNEL_CONFIG;
    const count = Math.max(1, domains.length);
    // Une carte par domaine : jamais d'instance vide / dupliquée sur l'ellipse.
    const cardCount = Math.min(
      isMobile ? config.mobileCardCount : config.cardCount,
      count
    );
    const dprMax = isMobile ? config.dprMaxMobile : config.dprMax;

    let THREE: typeof import("three");
    let renderer: Three.WebGLRenderer | null = null;
    const cleanups: Array<() => void> = [];

    const cards: CardRef[] = [];
    const maps: Array<{ uMap: { value: Three.Texture } }> = [];

    /* Inertie / pli */
    let offset = 0;
    let velocity = 0;
    let foldAngle = 0;
    let foldVelocity = 0;
    let dragPointer: number | null = null;
    let dragX = 0;
    let lastFrame = 0;
    let lastAnnounce = 0;
    let announced = "";

    (async () => {
      THREE = await import("three");
      if (disposed) return;

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(dprMax, window.devicePixelRatio || 1));

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(config.fov, 1, 0.05, 100);
      const camZ = config.ellipseB * config.cameraZ;
      camera.position.set(0, 0, camZ);
      camera.lookAt(0, 0, -config.ellipseB);

      /* Placeholder 1×1 transparent, remplacé dès que les photos arrivent. */
      const placeholder = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
      placeholder.needsUpdate = true;

      for (let i = 0; i < count; i++) {
        maps.push({ uMap: { value: placeholder } });
      }

      /* Répartition : arc / nombre de cartes - gap cible. */
      const arc = ellipseCircumference(config.ellipseA, config.ellipseB);
      const cardSize = Math.min(config.cardSize, arc / cardCount - config.spacing);
      const geometry = new THREE.PlaneGeometry(cardSize, cardSize);
      // Origine déplacée sur l'arête gauche → le pli tourne autour de cette arête.
      geometry.translate(cardSize / 2, 0, 0);

      const themeForAccent = themeRef.current;

      for (let i = 0; i < cardCount; i++) {
        const domain = i % count;
        const map = maps[domain];
        const accent = ACCENTS[domain % ACCENTS.length][themeForAccent];

        const material = new THREE.ShaderMaterial({
          uniforms: {
            uMap: map.uMap,
            uExit: { value: 0 },
            uStretch: { value: config.exitStretch },
            uFringe: { value: config.fringe },
            uHaze: { value: config.haze },
            uAccent: { value: new THREE.Color(accent) },
            uOpacity: { value: 1 },
          },
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          transparent: true,
          depthWrite: true,
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = -cardSize / 2;

        const outer = new THREE.Group();
        outer.add(mesh);
        scene.add(outer);

        cards.push({ outer, mesh, material, domain, slot: i });
      }

      /* ── Textures ─────────────────────────────────────────────────────── */

      const applyAccents = (t: Theme) => {
        cards.forEach((card) => {
          const accent = ACCENTS[card.domain % ACCENTS.length][t];
          card.material.uniforms.uAccent.value.set(accent);
        });
        dirty = true;
      };

      apiRef.current = { setTheme: applyAccents };

      /* Photos : une seule texture par fichier, réutilisée pour les doublons. */
      const photoTextures: Three.Texture[] = [];
      (async () => {
        try {
          const sources = Array.from(new Set<string>(CARD_PHOTOS));
          const loader = new THREE.TextureLoader();
          const originals = await Promise.all(sources.map((src) => loader.loadAsync(src)));
          if (disposed) {
            originals.forEach((tex) => tex.dispose());
            return;
          }

          // Les sources font 2048 px : on les réduit avant l'upload GPU (les
          // cartes affichées font ~130 px à l'écran).
          const maxSize = isMobile ? config.textureMaxSizeMobile : config.textureMaxSize;
          const loaded = originals.map((sourceTex) => {
            const img = sourceTex.image as HTMLImageElement;
            const iw = img.naturalWidth || img.width;
            const ih = img.naturalHeight || img.height;
            const scale = Math.min(1, maxSize / Math.max(iw, ih));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(iw * scale));
            canvas.height = Math.max(1, Math.round(ih * scale));
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = "high";
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            sourceTex.dispose();
            return new THREE.CanvasTexture(canvas);
          });

          const maxAniso = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
          loaded.forEach((tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = Math.min(8, maxAniso);
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.needsUpdate = true;
          });

          const bySource = new Map(sources.map((src, i) => [src, loaded[i]]));
          maps.forEach((map, i) => {
            map.uMap.value = bySource.get(CARD_PHOTOS[i % CARD_PHOTOS.length]) ?? loaded[0];
          });
          photoTextures.push(...loaded);

          dirty = true;
          setStatus("ready");
        } catch {
          if (disposed) return;
          setStatus("fallback");
          running = false;
        }
      })();

      /* ── Taille ───────────────────────────────────────────────────────── */

      const resize = () => {
        if (!renderer) return;
        const rect = stage.getBoundingClientRect();
        const w = Math.max(1, rect.width);
        const h = Math.max(1, rect.height);
        renderer.setPixelRatio(Math.min(dprMax, window.devicePixelRatio || 1));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        dirty = true;
      };
      resize();

      const ro = new ResizeObserver(resize);
      ro.observe(stage);
      cleanups.push(() => ro.disconnect());

      /* ── Interactions ─────────────────────────────────────────────────── */

      const onPointerDown = (e: PointerEvent) => {
        if (reduced) return;
        dragPointer = e.pointerId;
        dragX = e.clientX;
        velocity = 0;
        stage.setPointerCapture?.(e.pointerId);
      };

      const onPointerMove = (e: PointerEvent) => {
        if (dragPointer === null || e.pointerId !== dragPointer) return;
        const dx = e.clientX - dragX;
        dragX = e.clientX;
        offset += dx * config.dragStrength * 0.55;
        velocity = clamp(
          -dx * config.dragStrength * 60,
          -config.maxVelocity,
          config.maxVelocity
        );
      };

      const endDrag = (e: PointerEvent) => {
        if (dragPointer === null || e.pointerId !== dragPointer) return;
        dragPointer = null;
        try {
          stage.releasePointerCapture?.(e.pointerId);
        } catch {
          /* ignore */
        }
      };

      const onWheel = (e: WheelEvent) => {
        if (reduced) return;
        // Axe horizontal uniquement : le scroll vertical reste celui de la page.
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        velocity = clamp(
          velocity - e.deltaX * config.wheelStrength,
          -config.maxVelocity,
          config.maxVelocity
        );
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (reduced) return;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          velocity = clamp(velocity + 0.4, -config.maxVelocity, config.maxVelocity);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          velocity = clamp(velocity - 0.4, -config.maxVelocity, config.maxVelocity);
        }
      };

      stage.addEventListener("pointerdown", onPointerDown);
      stage.addEventListener("pointermove", onPointerMove);
      stage.addEventListener("pointerup", endDrag);
      stage.addEventListener("pointercancel", endDrag);
      stage.addEventListener("wheel", onWheel, { passive: false });
      stage.addEventListener("keydown", onKeyDown);
      cleanups.push(() => {
        stage.removeEventListener("pointerdown", onPointerDown);
        stage.removeEventListener("pointermove", onPointerMove);
        stage.removeEventListener("pointerup", endDrag);
        stage.removeEventListener("pointercancel", endDrag);
        stage.removeEventListener("wheel", onWheel);
        stage.removeEventListener("keydown", onKeyDown);
      });

      /* ── Boucle ───────────────────────────────────────────────────────── */

      const foldStart = -Math.PI * 0.3;
      const foldEnd = -Math.PI * 0.48;
      const hideAt = Math.PI * 0.58;

      const renderFrame = (now: number) => {
        if (!renderer) return;
        const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 1 / 60;
        lastFrame = now;

        if (!reduced) {
          const cruise = config.speed;
          offset -= (cruise + velocity) * dt;
          velocity *= Math.exp(-config.damping * dt);
          if (Math.abs(velocity) < 0.0004) velocity = 0;
        }

        // Ressort critique pour le pli (target proportionnel à la vitesse).
        const target = reduced ? 0 : clamp(velocity * config.fold, -0.6, 0.6);
        const omega = config.foldSpring;
        foldVelocity += (target - foldAngle) * omega * omega * dt - 2 * omega * foldVelocity * dt;
        foldAngle += foldVelocity * dt;

        let frontTitle = "";
        let frontDelta = Infinity;

        for (const card of cards) {
          const base = (card.slot / cardCount) * Math.PI * 2;
          const t = wrapAngle(base + offset);
          const visible = Math.abs(t) <= hideAt;
          card.outer.visible = visible;
          if (!visible) continue;

          const x = config.ellipseA * Math.sin(t);
          const z = -config.ellipseB * Math.cos(t);
          card.outer.position.set(x, 0, z);
          card.outer.rotation.y = -t;

          // Pli d'autant plus marqué que la carte est proche du bord gauche.
          const leftness = clamp(-t / hideAt, 0, 1);
          card.mesh.rotation.y = foldAngle * (0.35 + leftness * 0.65);

          const exit = reduced
            ? 0
            : clamp((foldStart - t) / (foldStart - foldEnd), 0, 1);
          card.material.uniforms.uExit.value = exit;
          card.mesh.scale.x = 1 + exit * 0.6;
          card.material.uniforms.uOpacity.value = 1;

          // Carte « au fond » (centre visuel) pour l'annonce aria-live.
          if (Math.abs(t) < frontDelta) {
            frontDelta = Math.abs(t);
            const list = domainsRef.current;
            const d = list[card.domain % Math.max(1, list.length)];
            frontTitle = d?.title ?? "";
          }
        }

        if (frontTitle && frontTitle !== announced && now - lastAnnounce > 2500) {
          announced = frontTitle;
          lastAnnounce = now;
          if (liveRef.current) liveRef.current.textContent = frontTitle;
        }

        renderer.render(scene, camera);
      };

      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (!running || (!onScreen && config.pauseOffscreen) || document.hidden) {
          lastFrame = now;
          return;
        }
        if (reduced) {
          // Rendu à la demande : plan fixe, redessiné après resize/thème.
          if (!dirty) return;
          dirty = false;
        }
        renderFrame(now);
      };

      raf = requestAnimationFrame(loop);

      /* Pause hors écran / onglet caché. */
      const io = new IntersectionObserver(
        (entries) => {
          onScreen = entries.some((entry) => entry.isIntersecting);
          // Le buffer dessiné peut être jeté : on redessine à chaque retour.
          if (onScreen) dirty = true;
        },
        { threshold: 0 }
      );
      io.observe(stage);
      cleanups.push(() => io.disconnect());

      const onVisibility = () => {
        if (!document.hidden) {
          lastFrame = 0;
          dirty = true;
        }
      };
      document.addEventListener("visibilitychange", onVisibility);
      cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

      cleanups.push(() => {
        cancelAnimationFrame(raf);
        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss();
        }
        geometry.dispose();
        cards.forEach((card) => card.material.dispose());
        photoTextures.forEach((tex) => tex.dispose());
        placeholder.dispose();
      });
    })().catch(() => {
      if (!disposed) {
        apiRef.current = null;
        setStatus("fallback");
        running = false;
      }
    });

    return () => {
      disposed = true;
      running = false;
      apiRef.current = null;
      cleanups.forEach((fn) => {
        try {
          fn();
        } catch {
          /* ignore */
        }
      });
    };
    // Scène créée une seule fois : les changements de thème passent par
    // apiRef.setTheme (accents), pas par un remount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Changement de thème → accents des cartes. */
  useEffect(() => {
    apiRef.current?.setTheme(theme);
  }, [theme]);

  const themeLabel = theme === "light" ? "light" : "dark";

  return (
    <div
      ref={stageRef}
      className="xt-stage"
      data-theme={themeLabel}
      data-status={status}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.region}
    >
      <canvas ref={canvasRef} className="xt-canvas" aria-hidden="true" />

      <div className="xt-glow" aria-hidden="true" />
      <div className="xt-gradient" aria-hidden="true" />

      {status === "loading" && (
        <div className="xt-loading" aria-hidden="true">
          <span />
        </div>
      )}

      {status === "fallback" && (
        <div className="xt-fallback" role="list" aria-label={labels.region}>
          {domains.map((d, i) => (
            <figure
              className="xt-fallback-card"
              role="listitem"
              key={`${d.title}-${i}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CARD_PHOTOS[i % CARD_PHOTOS.length]}
                alt=""
                width={2048}
                height={2048}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <strong>{d.title}</strong>
                <span>{d.subtitle}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <div ref={liveRef} className="sr-only" aria-live="polite" aria-atomic="true" />
    </div>
  );
}
