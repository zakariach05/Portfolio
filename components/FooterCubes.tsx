"use client";

/**
 * FooterCubes — mot géant tronqué + cubes 3D qui tombent sur le bord bas.
 *
 * Le canvas WebGL est transparent et se superpose au mot (rendu dans Footer).
 * Tout est chargé à la demande (three + cannon-es) quand le footer approche
 * du viewport, puis la physique tourne uniquement quand il est visible.
 */
import { useEffect, useRef, useState } from "react";
import type * as CannonNS from "cannon-es";
import type * as ThreeNS from "three";

/* ── Réglages ─────────────────────────────────────────────────── */

export const CUBE_LOGOS = [
  "/NV-IMG/cube-footer/logo-1-fragments-red.png",
  "/NV-IMG/cube-footer/logo-2-stone-silver.png",
  "/NV-IMG/cube-footer/logo-3-stone-red.png",
];

const FALLBACK_GLOWS = ["#ef4444", "#d0d0d8", "#e10600"];

const CUBE_CONFIG = {
  tileSize: 72,
  tileSizeMobile: 52,
  fov: 30,
  gravity: -30,
  restitution: 0.45,
  friction: 0.4,
  angularDamping: 0.2,
  launchMin: 12,
  launchMax: 18,
  glowNormal: 0.25,
  glowFlash: 1.8,
  geometrySegments: 4,
  cornerRadius: 0.2,
  dprMax: 2,
  dprMaxMobile: 1.5,
  logoFill: 0.76,
  restEase: 9,
} as const;

/** Nombre de cubes lâchés à chaque clic (un par logo). */
const SPAWN_PER_CLICK = 3;
/** Écart horizontal entre les cubes d'un même clic. */
const SPAWN_SPREAD = 0.9;
/** Délai entre le début de la sortie et l'entrée des nouveaux cubes. */
const ENTER_DELAY = 120;
/** Plafond absolu de cubes vivants, clics rapides compris. */
const MAX_LIVE_CUBES = 9;

/** Style de sortie : "drop" (chute sous le footer) ou "dissolve". */
type ExitStyle = "drop" | "dissolve";
const EXIT_STYLE: ExitStyle = "drop";
const EXIT_DURATION = 500;
const EXIT_MIN_SCALE = 0.6;
const DISSOLVE_DURATION = 360;

/** prefers-reduced-motion : simple fondu, sans physique. */
const REDUCED_FADE = 320;
const REDUCED_ROW_GAP = 1.6;

type Props = {
  hint: string;
  buttonLabel: string;
};

type SceneApi = {
  start: () => void;
  stop: () => void;
  resize: () => void;
  burstAt: (clientX: number, clientY: number) => void;
  burstCenter: () => void;
  hoverAt: (clientX: number, clientY: number) => void;
  destroy: () => void;
};

type ExitMode = ExitStyle | "fade";

type Cube = {
  body: CannonNS.Body;
  mesh: ThreeNS.Mesh;
  sprite: ThreeNS.Sprite;
  logo: number;
  restZ: number;
  flashStart: number;
  state: "live" | "exiting";
  exitMode: ExitMode;
  exitStart: number;
  exitDuration: number;
  /** Fondu d'entrée, uniquement en mode reduced motion. */
  enterStart: number;
  materials: ThreeNS.MeshStandardMaterial[];
  ownsMaterials: boolean;
  spriteMaterial: ThreeNS.SpriteMaterial;
  bodyInWorld: boolean;
};

type Particle = {
  mesh: ThreeNS.Mesh;
  material: ThreeNS.MeshBasicMaterial;
  velocity: ThreeNS.Vector3;
  spin: ThreeNS.Vector3;
  life: number;
  max: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const quatDot = (a: CannonNS.Quaternion, b: CannonNS.Quaternion) =>
  a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;

/* ── Encodage canvas → texture ────────────────────────────────── */

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number
) {
  const r = Math.min(radius, size / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + size - r, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + r);
  ctx.lineTo(x + size, y + size - r);
  ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
  ctx.lineTo(x + r, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Moyenne des pixels opaques du logo → couleur de glow. */
function averageGlow(img: HTMLImageElement, fallback: string): string {
  try {
    const S = 48;
    const canvas = document.createElement("canvas");
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return fallback;
    ctx.drawImage(img, 0, 0, S, S);
    const data = ctx.getImageData(0, 0, S, S).data;
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 128) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count += 1;
      }
    }
    if (!count) return fallback;
    return `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(
      b / count
    )})`;
  } catch {
    return fallback;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`logo: ${src}`));
    img.src = src;
  });
}

/* ── Composant ────────────────────────────────────────────────── */

export default function FooterCubes({ hint, buttonLabel }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<SceneApi | null>(null);

  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "fallback">(
    "idle"
  );
  const [started, setStarted] = useState(false);
  const [fallbackTurn, setFallbackTurn] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    // Le mot géant est le seul déclencheur : il vit dans Footer, au-dessus
    // du canvas, dans le même .fc-stage.
    const stage = root.closest(".fc-stage") as HTMLElement | null;
    const word = stage?.querySelector<HTMLElement>(".fc-word") ?? null;

    let disposed = false;
    let loading = false;
    let ready = false;
    let visible = false;
    let fallbackMode = false;
    let spawnTimer: number | undefined;
    // Un clic pendant le chargement est rejoué dès que la scène est prête.
    let pendingClick: { x: number; y: number } | null = null;

    let api: SceneApi | null = null;

    /* ── Init lourd (three + cannon-es), déclenché à l'approche ── */

    const init = async () => {
      const THREE = await import("three");
      const CANNON = await import("cannon-es");
      const { RoundedBoxGeometry } = await import(
        "three/examples/jsm/geometries/RoundedBoxGeometry.js"
      );
      if (disposed) return;

      // Précharge les 3 logos avant de fabriquer les textures.
      const images = await Promise.all(CUBE_LOGOS.map((src) => loadImage(src)));
      if (disposed) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const tile = mobile ? CUBE_CONFIG.tileSizeMobile : CUBE_CONFIG.tileSize;
      const dprCap = mobile ? CUBE_CONFIG.dprMaxMobile : CUBE_CONFIG.dprMax;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(CUBE_CONFIG.fov, 1, 0.1, 200);
      camera.position.set(0, 1, 8);
      camera.lookAt(0, 1, 0);

      let worldWidth = 1;
      let worldHeight = 1;
      let running = false;
      let rafId = 0;
      let lastTime = 0;
      let hoverTime = 0;

      /* ── Physique ── */

      const world = new CANNON.World({
        gravity: new CANNON.Vec3(0, CUBE_CONFIG.gravity, 0),
      });
      world.allowSleep = true;
      world.broadphase = new CANNON.SAPBroadphase(world);
      world.defaultContactMaterial.friction = CUBE_CONFIG.friction;
      world.defaultContactMaterial.restitution = CUBE_CONFIG.restitution;
      (world.solver as CannonNS.GSSolver).iterations = 10;

      const floor = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(100, 0.5, 4)),
      });
      floor.position.set(0, -0.5, 0);
      world.addBody(floor);

      const leftWall = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 60, 4)),
      });
      leftWall.position.set(-10, 60, 0);
      world.addBody(leftWall);

      const rightWall = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 60, 4)),
      });
      rightWall.position.set(10, 60, 0);
      world.addBody(rightWall);

      /* ── Lumières ── */

      scene.add(new THREE.HemisphereLight(0xffffff, 0x0a0a0a, 1.6));
      const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
      dirLight.position.set(-4, 8, 8);
      scene.add(dirLight);
      scene.add(dirLight.target);

      /* ── Textures / matériaux ── */

      const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

      const makeFaceTexture = (img: HTMLImageElement) => {
        const S = 256;
        const face = document.createElement("canvas");
        face.width = S;
        face.height = S;
        const ctx = face.getContext("2d");
        if (!ctx) throw new Error("2d context");

        // Fond sombre (couvre les coins arrondis) + tuile "dark glass".
        ctx.fillStyle = "#101012";
        ctx.fillRect(0, 0, S, S);
        roundedRectPath(ctx, 2, 2, S - 4, 46);
        ctx.fillStyle = "#18181a";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255,255,255,0.10)";
        ctx.stroke();

        const box = S * CUBE_CONFIG.logoFill;
        const ratio = img.width / Math.max(img.height, 1);
        const w = ratio > 1 ? box : box * ratio;
        const h = ratio > 1 ? box / ratio : box;
        ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);

        const texture = new THREE.CanvasTexture(face);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = maxAniso;
        return texture;
      };

      const glowColors = images.map((img, i) =>
        averageGlow(img, FALLBACK_GLOWS[i % FALLBACK_GLOWS.length])
      );
      const faceTextures = images.map(makeFaceTexture);
      const materials = faceTextures.map((texture, i) => {
        const glow = new THREE.Color(glowColors[i]);
        return Array.from(
          { length: 6 },
          () =>
            new THREE.MeshStandardMaterial({
              map: texture,
              emissive: glow,
              emissiveMap: texture,
              emissiveIntensity: CUBE_CONFIG.glowNormal,
              roughness: 0.35,
              metalness: 0.1,
            })
        );
      });

      const geometry = new RoundedBoxGeometry(
        1,
        1,
        1,
        CUBE_CONFIG.geometrySegments,
        CUBE_CONFIG.cornerRadius
      );

      // Halo additif partagé pour les 3 logos.
      const glowTexture = (() => {
        const S = 128;
        const c = document.createElement("canvas");
        c.width = S;
        c.height = S;
        const ctx = c.getContext("2d");
        if (ctx) {
          const grad = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
          grad.addColorStop(0, "rgba(255,255,255,0.9)");
          grad.addColorStop(0.35, "rgba(255,255,255,0.35)");
          grad.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, S, S);
        }
        const texture = new THREE.CanvasTexture(c);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      })();

      const glowMaterials = glowColors.map(
        (color) =>
          new THREE.SpriteMaterial({
            map: glowTexture,
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
      );

      const particleGeometry = new THREE.BoxGeometry(1, 1, 1);
      const cubes: Cube[] = [];
      const particles: Particle[] = [];

      /* ── Helpers scène ── */

      const toPlane = (clientX: number, clientY: number) => {
        const rect = root.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) {
          return new THREE.Vector2(0, worldHeight / 2);
        }
        const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        const ray = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
        ray.sub(camera.position).normalize();
        if (Math.abs(ray.z) < 0.001) return new THREE.Vector2(0, worldHeight / 2);
        const t = -camera.position.z / ray.z;
        return new THREE.Vector2(
          clamp(camera.position.x + ray.x * t, -worldWidth, worldWidth),
          clamp(camera.position.y + ray.y * t, -worldHeight, worldHeight * 2)
        );
      };

      const flashOf = (cube: Cube, now: number) =>
        cube.flashStart < 0
          ? 0
          : Math.max(0, 1 - (now - cube.flashStart) / 1000);

      const spawnCube = (
        x: number,
        y: number,
        vx: number,
        vy: number,
        logo: number,
        flash = true
      ) => {
        const body = new CANNON.Body({
          mass: 1,
          shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
          linearDamping: 0.02,
          angularDamping: CUBE_CONFIG.angularDamping,
          allowSleep: true,
          sleepSpeedLimit: 0.12,
          sleepTimeLimit: 0.45,
        });
        body.position.set(x, y, 0);
        body.quaternion.setFromEuler(rand(-1, 1), rand(-1, 1), rand(-1, 1));
        body.linearFactor.set(1, 1, 0);
        body.angularFactor.set(1, 1, 1);
        body.velocity.set(vx, vy, 0);
        body.angularVelocity.set(rand(-6, 6), rand(-6, 6), rand(-6, 6));
        world.addBody(body);

        // En mode normal, les matériaux de face restent partagés par logo
        // (le flash est appliqué juste avant le render). En reduced motion,
        // chaque cube possède ses clones pour pouvoir fondre séparément.
        const ownsMaterials = reduced;
        const faceMaterials = ownsMaterials
          ? materials[logo].map((material) => {
              const clone = material.clone();
              clone.transparent = true;
              return clone;
            })
          : materials[logo];

        const mesh = new THREE.Mesh(geometry, faceMaterials);
        mesh.position.set(x, y, 0);
        mesh.frustumCulled = false;
        scene.add(mesh);

        // Le halo est toujours cloné : chaque cube doit pouvoir s'éteindre
        // indépendamment pendant sa sortie.
        const spriteMaterial = glowMaterials[logo].clone();
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(x, y, -0.18);
        sprite.scale.set(2.8, 2.8, 1);
        scene.add(sprite);

        const cube: Cube = {
          body,
          mesh,
          sprite,
          logo,
          restZ: rand(-8, 8) * (Math.PI / 180),
          flashStart: flash ? performance.now() : -1,
          state: "live",
          exitMode: EXIT_STYLE,
          exitStart: -1,
          exitDuration: EXIT_DURATION,
          enterStart: -1,
          materials: faceMaterials,
          ownsMaterials,
          spriteMaterial,
          bodyInWorld: true,
        };

        cubes.push(cube);
        return cube;
      };

      const removeCube = (cube: Cube) => {
        if (cube.bodyInWorld) {
          world.removeBody(cube.body);
          cube.bodyInWorld = false;
        }
        scene.remove(cube.mesh);
        scene.remove(cube.sprite);
        cube.spriteMaterial.dispose();
        if (cube.ownsMaterials) {
          for (const material of cube.materials) material.dispose();
        }
        const index = cubes.indexOf(cube);
        if (index !== -1) cubes.splice(index, 1);
      };

      const setReducedOpacity = (cube: Cube, opacity: number) => {
        if (!cube.ownsMaterials) return;
        for (const material of cube.materials) material.opacity = opacity;
        cube.spriteMaterial.opacity = 0.5 * opacity;
      };

      const spawnParticles = (cube: Cube) => {
        for (let i = 0; i < 6; i += 1) {
          const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(glowColors[cube.logo]),
            transparent: true,
            opacity: 0.9,
          });
          const mesh = new THREE.Mesh(particleGeometry, material);
          const scale = rand(0.14, 0.22);
          mesh.scale.setScalar(scale);
          mesh.position.set(
            cube.body.position.x + rand(-0.3, 0.3),
            cube.body.position.y + rand(-0.3, 0.3),
            0.1
          );
          scene.add(mesh);
          particles.push({
            mesh,
            material,
            velocity: new THREE.Vector3(rand(-3.5, 3.5), rand(1, 5), rand(-1, 1)),
            spin: new THREE.Vector3(rand(-8, 8), rand(-8, 8), rand(-8, 8)),
            life: 0,
            max: 0.6,
          });
        }
      };

      /* ── Pose de repos : face caméra + petit z ── */

      const axisQuats: CannonNS.Quaternion[] = [];
      const faceVectors = [
        new CANNON.Vec3(1, 0, 0),
        new CANNON.Vec3(-1, 0, 0),
        new CANNON.Vec3(0, 1, 0),
        new CANNON.Vec3(0, -1, 0),
        new CANNON.Vec3(0, 0, 1),
        new CANNON.Vec3(0, 0, -1),
      ];
      const front = new CANNON.Vec3(0, 0, 1);
      for (const normal of faceVectors) {
        const base = new CANNON.Quaternion().setFromVectors(normal, front);
        for (let k = 0; k < 4; k += 1) {
          const spin = new CANNON.Quaternion().setFromAxisAngle(
            front,
            (k * Math.PI) / 2
          );
          axisQuats.push(base.mult(spin));
        }
      }

      const nearestQuat = new CANNON.Quaternion();
      const restQuat = new CANNON.Quaternion();
      const restSpin = new CANNON.Quaternion();

      const applyRest = (cube: Cube, dt: number) => {
        if (cube.state !== "live") return;
        const body = cube.body;
        const slow =
          body.velocity.lengthSquared() < 0.2 &&
          body.angularVelocity.lengthSquared() < 0.8 &&
          body.position.y < 1.9;
        if (!slow) {
          body.allowSleep = true;
          return;
        }

        let bestDot = -1;
        for (const candidate of axisQuats) {
          const dot = Math.abs(quatDot(body.quaternion, candidate));
          if (dot > bestDot) {
            bestDot = dot;
            nearestQuat.copy(candidate);
          }
        }
        restSpin.setFromAxisAngle(front, cube.restZ);
        nearestQuat.mult(restSpin, restQuat);

        const aligned = Math.abs(quatDot(body.quaternion, restQuat)) > 0.9995;
        if (aligned) {
          body.quaternion.copy(restQuat);
          body.angularVelocity.setZero();
          if (body.position.y < 0.5) body.position.y = 0.5;
          body.allowSleep = true;
        } else {
          body.allowSleep = false;
          body.quaternion.slerp(
            restQuat,
            1 - Math.exp(-CUBE_CONFIG.restEase * dt),
            body.quaternion
          );
          body.angularVelocity.scale(0.9, body.angularVelocity);
          body.wakeUp();
        }
      };

      /* ── Boucle ── */

      // Les 3 jeux de matériaux sont partagés : three n'envoie les uniforms
      // qu'au changement de matériau, donc on applique le flash du cube le
      // plus récent de chaque logo juste avant le render.
      const applyGlow = (now: number) => {
        for (let i = 0; i < materials.length; i += 1) {
          let flash = 0;
          for (const cube of cubes) {
            if (cube.state !== "live" || cube.logo !== i) continue;
            const value = flashOf(cube, now);
            if (value > flash) flash = value;
          }
          const intensity =
            CUBE_CONFIG.glowNormal +
            flash * (CUBE_CONFIG.glowFlash - CUBE_CONFIG.glowNormal);
          for (const material of materials[i]) {
            material.emissiveIntensity = intensity;
          }
        }
      };

      const sync = () => {
        const now = performance.now();
        applyGlow(now);
        for (const cube of cubes) {
          cube.mesh.position.set(cube.body.position.x, cube.body.position.y, 0);
          cube.mesh.quaternion.set(
            cube.body.quaternion.x,
            cube.body.quaternion.y,
            cube.body.quaternion.z,
            cube.body.quaternion.w
          );
          cube.sprite.position.set(cube.body.position.x, cube.body.position.y, -0.18);
          const glow = 2.8 + flashOf(cube, now) * 1.6;
          cube.sprite.scale.set(glow, glow, 1);
        }
      };

      const updateParticles = (dt: number) => {
        for (let i = particles.length - 1; i >= 0; i -= 1) {
          const particle = particles[i];
          particle.life += dt;
          const k = Math.min(particle.life / particle.max, 1);
          particle.velocity.y -= 18 * dt;
          particle.mesh.position.addScaledVector(particle.velocity, dt);
          particle.mesh.rotation.x += particle.spin.x * dt;
          particle.mesh.rotation.y += particle.spin.y * dt;
          particle.mesh.rotation.z += particle.spin.z * dt;
          particle.mesh.scale.setScalar(Math.max(0.01, 0.2 * (1 - k)));
          particle.material.opacity = 0.9 * (1 - k);
          if (k >= 1) {
            scene.remove(particle.mesh);
            particle.material.dispose();
            particles.splice(i, 1);
          }
        }
      };

      /* ── Sorties / fondus ── */

      const beginExit = (cube: Cube, now: number) => {
        if (cube.state !== "live") return;
        cube.state = "exiting";
        cube.exitStart = now;
        cube.flashStart = -1;
        cube.enterStart = -1;

        // Plus aucune collision : les cubes traversent le sol et le bas
        // du footer pendant leur sortie.
        cube.body.collisionFilterMask = 0;
        cube.body.allowSleep = false;
        cube.body.wakeUp();

        if (reduced) {
          cube.exitMode = "fade";
          cube.exitDuration = REDUCED_FADE;
          if (cube.bodyInWorld) {
            world.removeBody(cube.body);
            cube.bodyInWorld = false;
          }
          return;
        }

        if (EXIT_STYLE === "drop") {
          cube.exitMode = "drop";
          cube.exitDuration = EXIT_DURATION;
          // Petit saut vers le haut puis la gravité l'emporte sous le footer.
          cube.body.velocity.set(rand(-1.2, 1.2), rand(0.9, 2.4), 0);
          cube.body.angularVelocity.set(rand(-7, 7), rand(-7, 7), rand(-5, 5));
          return;
        }

        cube.exitMode = "dissolve";
        cube.exitDuration = DISSOLVE_DURATION;
        cube.body.velocity.setZero();
        cube.body.angularVelocity.setZero();
        spawnParticles(cube);
        if (cube.bodyInWorld) {
          world.removeBody(cube.body);
          cube.bodyInWorld = false;
        }
      };

      const updateExits = (now: number) => {
        for (let i = cubes.length - 1; i >= 0; i -= 1) {
          const cube = cubes[i];
          if (cube.state !== "exiting") continue;
          const k = clamp((now - cube.exitStart) / cube.exitDuration, 0, 1);

          if (cube.exitMode === "fade") {
            setReducedOpacity(cube, 1 - k);
          } else if (cube.exitMode === "dissolve") {
            cube.mesh.scale.setScalar(Math.max(0.001, 1 - k));
            cube.spriteMaterial.opacity = 0.5 * (1 - k);
          } else {
            cube.mesh.scale.setScalar(1 - (1 - EXIT_MIN_SCALE) * k);
            cube.spriteMaterial.opacity = 0.5 * (1 - k);
          }

          if (k >= 1) removeCube(cube);
        }
      };

      const updateReducedEnter = (now: number) => {
        for (const cube of cubes) {
          if (cube.state !== "live" || cube.enterStart < 0) continue;
          const k = clamp((now - cube.enterStart) / REDUCED_FADE, 0, 1);
          setReducedOpacity(cube, k);
          if (k >= 1) cube.enterStart = -1;
        }
      };

      const isBusy = (now: number) => {
        if (particles.length) return true;
        for (const cube of cubes) {
          if (cube.state === "exiting" || cube.enterStart >= 0) return true;
          if (reduced) continue;
          if (flashOf(cube, now) > 0) return true;
          if (cube.body.sleepState !== CANNON.Body.SLEEPING) return true;
        }
        return false;
      };

      const tick = (time: number) => {
        if (!running) return;
        const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
        lastTime = time;
        const now = performance.now();

        if (!reduced) {
          world.step(1 / 60, dt, 3);
          updateParticles(dt);
          for (const cube of cubes) applyRest(cube, dt);
        } else {
          updateReducedEnter(now);
        }
        updateExits(now);
        sync();
        renderer.render(scene, camera);

        // Aucun cube vivant / aucune animation : on coupe la boucle.
        if (!isBusy(now)) {
          running = false;
          rafId = 0;
          return;
        }
        rafId = requestAnimationFrame(tick);
      };

      const stop = () => {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        lastTime = 0;
      };

      const start = () => {
        if (disposed || running) return;
        // Pas de boucle de rendu tant qu'il n'y a rien à afficher.
        if (!cubes.length && !particles.length) return;
        running = true;
        lastTime = 0;
        rafId = requestAnimationFrame(tick);
      };

      /* ── Layout / resize ── */

      const applySize = () => {
        const width = Math.max(root.clientWidth, 1);
        const height = Math.max(root.clientHeight, 1);
        const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height, false);

        worldWidth = width / tile;
        worldHeight = height / tile;

        camera.aspect = width / height;
        camera.position.set(
          0,
          worldHeight / 2,
          worldHeight / 2 / Math.tan((CUBE_CONFIG.fov * Math.PI) / 360)
        );
        camera.lookAt(0, worldHeight / 2, 0);
        camera.updateProjectionMatrix();

        leftWall.position.x = -worldWidth / 2 - 0.5;
        rightWall.position.x = worldWidth / 2 + 0.5;

        dirLight.position.set(-worldWidth * 0.3, worldHeight + 4, 8);
        dirLight.target.position.set(0, worldHeight * 0.35, 0);
        dirLight.target.updateMatrixWorld();

        const limit = Math.max(worldWidth / 2 - 0.55, 0);
        for (const cube of cubes) {
          if (cube.state !== "live") continue;
          if (cube.body.position.x > limit) {
            cube.body.position.x = limit;
            cube.body.wakeUp();
          } else if (cube.body.position.x < -limit) {
            cube.body.position.x = -limit;
            cube.body.wakeUp();
          }
        }
      };

      /* ── Remplacement d'un groupe de 3 cubes ── */

      const shuffled = () => {
        const logos = [0, 1, 2];
        for (let i = logos.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [logos[i], logos[j]] = [logos[j], logos[i]];
        }
        return logos;
      };

      const ensureCapacity = () => {
        while (cubes.length + SPAWN_PER_CLICK > MAX_LIVE_CUBES) {
          // Priorité aux cubes déjà en sortie (les plus anciens d'abord).
          const victim =
            cubes.find((cube) => cube.state === "exiting") ?? cubes[0];
          if (!victim) return;
          removeCube(victim);
        }
      };

      const spawnGroup = (x: number, y: number) => {
        ensureCapacity();
        const logos = shuffled();
        const limit = Math.max(worldWidth / 2 - 0.7, 0);
        const offsets = [-SPAWN_SPREAD, 0, SPAWN_SPREAD];
        for (let i = 0; i < SPAWN_PER_CLICK; i += 1) {
          spawnCube(
            clamp(x + offsets[i], -limit, limit),
            clamp(y, 0.6, Math.max(worldHeight - 0.6, 0.6)),
            rand(-3.2, 3.2),
            rand(CUBE_CONFIG.launchMin, CUBE_CONFIG.launchMax),
            logos[i]
          );
        }
        start();
      };

      const spawnReducedRow = () => {
        const limit = Math.max(worldWidth / 2 - 0.8, 0);
        const gap = Math.min(REDUCED_ROW_GAP, limit);
        const offsets = [-gap, 0, gap];
        const now = performance.now();
        for (let i = 0; i < SPAWN_PER_CLICK; i += 1) {
          const cube = spawnCube(
            clamp(offsets[i], -limit, limit),
            0.5,
            0,
            0,
            i,
            false
          );
          cube.body.quaternion.setFromEuler(0, 0, cube.restZ);
          cube.body.velocity.setZero();
          cube.body.angularVelocity.setZero();
          cube.enterStart = now;
          setReducedOpacity(cube, 0);
        }
        start();
      };

      /* ── Interactions ── */

      const popAt = (clientX: number, clientY: number) => {
        if (disposed) return;
        const point = toPlane(clientX, clientY);
        const now = performance.now();
        const hadCubes = cubes.length > 0;

        // Les cubes encore en train d'entrer sortent aussi immédiatement.
        for (const cube of cubes) {
          if (cube.state === "live") beginExit(cube, now);
        }

        window.clearTimeout(spawnTimer);
        if (reduced) {
          // Sans physique : on laisse l'ancienne rangée finir son fondu
          // avant d'afficher la nouvelle.
          spawnTimer = window.setTimeout(
            () => {
              if (!disposed) spawnReducedRow();
            },
            hadCubes ? REDUCED_FADE : 0
          );
        } else {
          // Les 3 nouveaux arrivent ~120 ms après le début de la sortie.
          spawnTimer = window.setTimeout(() => {
            if (!disposed) spawnGroup(point.x, point.y);
          }, ENTER_DELAY);
        }
        start();
      };

      const burstAt = (clientX: number, clientY: number) => {
        popAt(clientX, clientY);
      };

      const burstCenter = () => {
        const rect = root.getBoundingClientRect();
        popAt(rect.left + rect.width / 2, rect.top + rect.height * 0.62);
      };

      const hoverAt = (clientX: number, clientY: number) => {
        if (reduced || disposed) return;
        const now = performance.now();
        if (now - hoverTime < 70) return;
        hoverTime = now;
        const point = toPlane(clientX, clientY);
        const radius = 1.6;
        let touched = false;
        for (const cube of cubes) {
          // On ne bouscule jamais un cube en cours de sortie.
          if (cube.state !== "live") continue;
          const dx = cube.body.position.x - point.x;
          const dy = cube.body.position.y - point.y;
          const distance2 = dx * dx + dy * dy;
          if (distance2 > radius * radius || distance2 < 1e-4) continue;
          const distance = Math.sqrt(distance2);
          const strength = (1 - distance / radius) * 0.5;
          cube.body.wakeUp();
          cube.body.applyImpulse(
            new CANNON.Vec3((dx / distance) * strength, (dy / distance) * strength + 0.1, 0)
          );
          touched = true;
        }
        if (touched) start();
      };

      /* ── Cycle de vie ── */

      applySize();

      const destroy = () => {
        stop();
        while (cubes.length) removeCube(cubes[cubes.length - 1]);
        for (const particle of particles) {
          scene.remove(particle.mesh);
          particle.material.dispose();
        }
        particles.length = 0;

        geometry.dispose();
        particleGeometry.dispose();
        for (const texture of faceTextures) texture.dispose();
        for (const set of materials) {
          for (const material of set) material.dispose();
        }
        glowTexture.dispose();
        for (const material of glowMaterials) material.dispose();

        renderer.dispose();
        renderer.forceContextLoss();
        scene.clear();
        if (apiRef.current === api) apiRef.current = null;
      };

      api = {
        start,
        stop,
        resize: () => {
          applySize();
          if (cubes.length) {
            sync();
            renderer.render(scene, camera);
          }
        },
        burstAt,
        burstCenter,
        hoverAt,
        destroy,
      };
      apiRef.current = api;
      ready = true;
      setStatus("ready");
      if (pendingClick) {
        const point = pendingClick;
        pendingClick = null;
        api.burstAt(point.x, point.y);
      }
    };

    const startInit = () => {
      if (loading || ready || disposed) return;
      loading = true;
      setStatus("loading");
      init()
        .then(() => {
          loading = false;
        })
        .catch(() => {
          loading = false;
          fallbackMode = true;
          if (!disposed) setStatus("fallback");
          if (pendingClick) {
            pendingClick = null;
            setFallbackTurn((turn) => turn + 1);
          }
        });
    };

    // WebGL indisponible → rangée CSS, aucun import lourd.
    let webgl = false;
    try {
      const probe = document.createElement("canvas");
      webgl = !!(probe.getContext("webgl2") || probe.getContext("webgl"));
    } catch {
      webgl = false;
    }

    let near: IntersectionObserver | null = null;
    if (webgl && "IntersectionObserver" in window) {
      near = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            near?.disconnect();
            startInit();
          }
        },
        { rootMargin: "100% 0px", threshold: 0 }
      );
      near.observe(root);
    }
    if (!webgl) {
      fallbackMode = true;
      setStatus("fallback");
    }

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        if (visible) api?.start();
        else api?.stop();
      },
      { threshold: 0.01 }
    );
    visibilityObserver.observe(root);

    const onVisibilityChange = () => {
      if (document.hidden) api?.stop();
      else if (visible) api?.start();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onResize = () => api?.resize();
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(root);
    window.addEventListener("resize", onResize);

    // Un seul point d'entrée : le mot géant (ou le bouton accessible).
    const trigger = (clientX: number, clientY: number) => {
      setStarted(true);
      if (apiRef.current) {
        apiRef.current.burstAt(clientX, clientY);
      } else if (fallbackMode) {
        // Sans WebGL : on échange les 3 tuiles plates.
        setFallbackTurn((turn) => turn + 1);
      } else {
        // La scène charge encore (three + logos) : on rejoue ce clic après.
        pendingClick = { x: clientX, y: clientY };
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      trigger(event.clientX, event.clientY);
    };
    word?.addEventListener("pointerdown", onPointerDown);

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      api?.hoverAt(event.clientX, event.clientY);
    };
    // Le survol du mot (et du stage) pousse doucement les cubes au repos.
    stage?.addEventListener("pointermove", onPointerMove);

    return () => {
      disposed = true;
      window.clearTimeout(spawnTimer);
      near?.disconnect();
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      word?.removeEventListener("pointerdown", onPointerDown);
      stage?.removeEventListener("pointermove", onPointerMove);
      api?.destroy();
      api = null;
    };
    // Scène créée une seule fois : les textes viennent des props DOM.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rootRef}
      className="fc-layer"
      data-status={status}
      data-started={started ? "true" : "false"}
    >
      <canvas ref={canvasRef} className="fc-canvas" aria-hidden="true" />

      <div className="fc-fallback" aria-hidden="true">
        {Array.from({ length: SPAWN_PER_CLICK }, (_, i) => {
          // Un clic décale les logos d'une tuile : les 3 logos restent
          // visibles, dans un ordre différent.
          const logo = (i + fallbackTurn) % CUBE_LOGOS.length;
          return (
            <span
              key={i}
              className="fc-tile"
              style={{ backgroundImage: `url("${CUBE_LOGOS[logo]}")` }}
            />
          );
        })}
      </div>

      <p className="fc-hint" aria-hidden="true">
        {hint}
      </p>

      <button
        type="button"
        className="fc-burst"
        disabled={status !== "ready" && status !== "fallback"}
        onClick={() => {
          setStarted(true);
          if (status === "fallback") {
            setFallbackTurn((turn) => turn + 1);
          } else {
            apiRef.current?.burstCenter();
          }
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
