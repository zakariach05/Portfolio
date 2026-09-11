/**
 * scripts/gen-assets.mjs — régénère les assets critiques pour le score PSI.
 *
 *  1. hero-poster.webp  : généré (gradient dark) car le poster mp4 404 → la
 *     vidéo/poster cassés coûtent 1+.rtals de blocage + un échec réseau.
 *  2. V.png → 384x384    : le canvas VLogo plafonne à MAX_RES=384 ; 1024px
 *     (516 KB) est du gaspillage pour un logo 80px. ~350 KB économisés.
 *
 * Usage : node scripts/gen-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = (f) => path.join(root, "public", f);

// ---- 1. Hero poster (dark, se décline en WebP) ---------------------------
const POSTER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
  <defs>
    <radialGradient id="g" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="#131318"/>
      <stop offset="45%" stop-color="#0b0b0f"/>
      <stop offset="100%" stop-color="#040405"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="55%" r="55%">
      <stop offset="0%" stop-color="#dc2626" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#dc2626" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#g)"/>
  <rect width="1920" height="1080" fill="url(#glow)"/>
</svg>`;

const posterPath = out("NV-IMG/hero-poster.webp");
await sharp(Buffer.from(POSTER_SVG))
  .webp({ quality: 70 })
  .toFile(posterPath);
const posterKB = Math.round(fs.statSync(posterPath).size / 1024);

// ---- 2. V.png → 384x384 (masque canvas + favicon) -----------------------
const vPath = out("NV-IMG/V.png");
const vBuf = await sharp(vPath).resize(384, 384, { fit: "contain" }).png().toBuffer();
const vMeta = await sharp(vBuf).metadata();
await fs.promises.writeFile(vPath, vBuf);
const vKB = Math.round(fs.statSync(vPath).size / 1024);

console.log(
  `hero-poster.webp  ${posterKB} KB (from ${vMeta.width}x${vMeta.height} video frame → generated)` +
    `\nV.png             ${vKB} KB (384x384, was 1024x1024 504 KB)`
);