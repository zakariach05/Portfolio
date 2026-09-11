#!/usr/bin/env node
/**
 * scripts/encode-video.mjs — encode la vidéo hero en 2 variantes optimisées :
 *  1. hero-video-mobile.webm  (VP9, 720p max, ~1-2 Mbps)   → priorité (léger)
 *  2. hero-video-mobile.mp4    (H.264, 720p max, ~1-2 Mbps) → fallback iOS/legacy
 *
 * Utilisation :  npm run encode:video   (ou  node scripts/encode-video.mjs)
 * Prérequis : ffmpeg installé et visible dans le PATH.
 *
 * La vidéo source prise = public/NV-IMG/vidio/video_preview_h264.mp4.
 * Les fichiers générés vont dans public/NV-IMG/vidio/.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "public", "NV-IMG", "vidio", "video_preview_h264.mp4");
const outDir = join(root, "public", "NV-IMG", "vidio");

const outputs = [
  {
    file: join(outDir, "hero-video-mobile.webm"),
    args: [
      "-c:v", "libvpx-vp9",
      "-deadline", "realtime",
      "-cpu-used", "5",
      "-b:v", "1200k",
      "-maxrate", "1600k",
      "-bufsize", "2400k",
      "-vf", "scale=720:-2",
      "-an",
    ],
  },
  {
    file: join(outDir, "hero-video-mobile.mp4"),
    args: [
      "-c:v", "libx264",
      "-preset", "slow",
      "-profile:v", "main",
      "-level", "3.1",
      "-b:v", "1500k",
      "-maxrate", "2000k",
      "-bufsize", "3000k",
      "-pix_fmt", "yuv420p",
      "-vf", "scale=720:-2",
      "-an",
    ],
  },
];

if (!existsSync(src)) {
  console.error(`Source introuvable : ${src}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

for (const out of outputs) {
  console.log(`→ Encodage ${out.file} …`);
  try {
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-i", src,
        ...out.args,
        "-movflags", "+faststart",
        out.file,
      ],
      { stdio: "inherit" }
    );
    console.log(`  ✔ ${out.file}`);
  } catch (err) {
    console.error(`  ✖ Échec pour ${out.file} :`, err.message);
    process.exit(1);
  }
}

console.log("Terminé.");