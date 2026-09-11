/**
 * upload-cloudinary.mjs — upload des images utilisées par le site.
 *
 * Prérequis : Cloudinary configuré dans .env.local/.env :
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud>
 *   CLOUDINARY_API_KEY=<key>
 *   CLOUDINARY_API_SECRET=<secret>
 *
 * Usage :
 *   node scripts/upload-cloudinary.mjs
 *
 * Structure créée (public_id) :
 *   portfolio/projets/<slug>   → captures projets (/img/*)
 *   portfolio/hero/<slug>      → médias hero + footer (/NV-IMG/*)
 *
 * Idempotent : re-running écrase le public_id avec le fichier local.
 * Utilise l'API REST v2 (fetch natif Node ≥18, aucune dépendance SDK).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, extname } from "node:path";

const PORTFOLIO_DIR = resolve("public");
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
const API_KEY = process.env.CLOUDINARY_API_KEY?.trim();
const API_SECRET = process.env.CLOUDINARY_API_SECRET?.trim();

if (!CLOUD || !API_KEY || !API_SECRET) {
  console.error(
    "Manque la config Cloudinary (.env.local) : cloud name, API key, API secret."
  );
  process.exit(1);
}

const API_BASE = `https://api.cloudinary.com/v1_1/${CLOUD}`;
const AUTH = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");

// ── Les fichiers réellement référencés dans le code (upload minimal,
//    on n'envoie pas les vieux assets non utilisés du dossier public).
const USED = [
  "img/hotel-photo.png",
  "img/agence-marketing-digital.png",
  "img/gestion-immobilier-en estrie.png",
  "img/la-casa.png",
  "img/05-Electro.png",
  "img/sparkvision.PNG",
  "img/meteo.png",
  "img/Bibliotique.png",
  "img/portfolio.png",
  "NV-IMG/hero-poster.webp",
  "NV-IMG/hero-mobile.webp",
  "NV-IMG/about-bg.webp",
  "NV-IMG/heroP_pro-80.webp",
  "NV-IMG/stylo.png",
  "NV-IMG/V.png",
  "NV-IMG/logo.png",
  "NV-IMG/svg-signature.svg",
  "NV-IMG/footer-img.png",
  "NV-IMG/vidio/footer video.png",
];

function toPublicId(rel) {
  const base =
    rel.startsWith("img/")
      ? rel.replace(/^img/, "portfolio/projets")
      : rel.replace(/^NV-IMG/, "portfolio/hero");
  const slug = base
    .replace(extname(base), "")
    .replace(/[^a-z0-9/]+/gi, "-")
    .replace(/\/-+/g, "/")
    .replace(/-+\//g, "/")
    .replace(/^portfolio\/hero\/vidio-/, "portfolio/hero/footer/")
    .toLowerCase();
  return slug;
}

async function uploadOne(file, publicId) {
  const data = readFileSync(file);
  const mimeExt = extname(file).toLowerCase();
  const mimeByExt = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".avif": "image/avif",
  };
  const blob = new Blob([data], { type: mimeByExt[mimeExt] ?? "image/png" });
  const fd = new FormData();
  fd.append("file", blob, publicId);
  fd.append("public_id", publicId);
  fd.append("overwrite", "true");
  fd.append("resource_type", "image");

  const res = await fetch(`${API_BASE}/image/upload`, {
    method: "POST",
    headers: { Authorization: `Basic ${AUTH}` },
    body: fd,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error?.message || `HTTP ${res.status}`);
  }
  return json.secure_url;
}

async function run() {
  let ok = 0;
  let fail = 0;
  for (const rel of USED) {
    const file = resolve(PORTFOLIO_DIR, rel);
    if (!statSync(file, { throwIfNoEntry: false })?.isFile()) {
      console.warn(`– absent (ignoré) : ${rel}`);
      continue;
    }
    const publicId = toPublicId(rel);
    try {
      const url = await uploadOne(file, publicId);
      console.log(`✓ ${publicId}  → ${url}`);
      ok++;
    } catch (err) {
      console.error(`✗ ${rel} → ${err.message ?? err}`);
      fail++;
    }
  }
  console.log("\nTerminé :", ok, "ok,", fail, "échec(s).");
  process.exit(fail ? 1 : 0);
}

run();