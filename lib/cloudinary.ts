/**
 * cloudinary.ts — configuration + mapping local → Cloudinary.
 *
 * IMPORTANT : tant que `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` n'est pas défini,
 * Cloudinary est désactivé et tout retombe silencieusement sur next/image
 * (aucune casse si la migration n'a pas encore été faite).
 *
 * Arborescence conseillée sur Cloudinary :
 *   portfolio/projets/…   → captures projets (/img/*)
 *   portfolio/hero/…      → images / fonds du hero
 *   portfolio/ui/…        → logos, avatars, icônes
 */

const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || "";

export const CLOUDINARY_ENABLED = Boolean(CLOUD_NAME);

/** Extraire le public_id Cloudinary depuis un chemin statique local. */
export function toPublicId(src: string): string {
  // "/img/hotel-photo.png"          → "portfolio/projets/hotel-photo"
  // "/NV-IMG/hero-mobile.webp"      → "portfolio/hero/hero-mobile"
  // "/NV-IMG/vidio/footer video.png"→ "portfolio/hero/footer-video"
  const clean = src.replace(/^\//, "");
  if (clean.startsWith("img/")) {
    return `portfolio/projets/${clean.slice(4)}`.replace(/\.[a-z0-9]+$/i, "");
  }
  const nv = clean.replace(/^NV-IMG\//, "");
  const withoutExt = nv.replace(/\.[a-z0-9]+$/i, "");
  const slug = withoutExt
    .replace(/^vidio\//, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `portfolio/hero/${slug}`;
}

/** même prop API utile pour le wrapper AppImage */
export type AppImageProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  quality?: number;
  className?: string;
  style?: React.CSSProperties;
  draggable?: boolean;
  id?: string;
  "aria-hidden"?: boolean | "true" | "false";
};

export { CLOUD_NAME };