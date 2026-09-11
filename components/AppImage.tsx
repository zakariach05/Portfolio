/**
 * AppImage — wrapper d'image.
 *
 * - Cloudinary configuré (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` posé) :
 *   utilise <CldImage> avec format auto (f_auto), qualité auto (q_auto),
 *   et transformations. En lazy : placeholder blur automatique.
 * - Sinon (pas encore migré / credentials absents) : next/image local.
 *
 * Props limitées volontairement à ce que le site utilise réellement.
 */
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { CLOUDINARY_ENABLED, toPublicId, type AppImageProps } from "@/lib/cloudinary";

export default function AppImage({
  src,
  alt = "",
  width,
  height,
  fill,
  sizes,
  loading,
  priority,
  fetchPriority,
  quality,
  className,
  style,
  draggable,
  id,
  ...rest
}: AppImageProps) {
  const shared = {
    id,
    alt,
    fill,
    width,
    height,
    sizes,
    loading,
    priority,
    fetchPriority,
    quality,
    className,
    style,
    draggable,
  };

  if (CLOUDINARY_ENABLED) {
    // eslint-disable-next-line jsx-a11y/alt-text -- alt est défini via les props et propagé ci-dessous
    return (
      <CldImage
        {...shared}
        src={toPublicId(src)}
        width={width || undefined}
        height={height || undefined}
        crop={fill ? "fill" : undefined}
        gravity="auto"
        quality={quality ?? "auto"}
        format="auto"
        placeholder={loading === "lazy" ? "blur" : undefined}
        {...(rest as Record<string, unknown>)}
      />
    );
  }

  return (
    <Image {...shared} src={src} {...(rest as Record<string, unknown>)} />
  );
}