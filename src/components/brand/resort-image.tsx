import Image from "next/image";

import type { SceneKey } from "@/content/rooms";
import { SceneArt } from "@/components/brand/scene-art";
import { cn } from "@/lib/utils";

/**
 * The single image seam. Pass `src` for a real photograph (Cloudinary or a
 * local file) and omit it to show the art-directed placeholder scene.
 * TODO(client): replace scene keys with the client's photography.
 */
export function ResortImage({
  scene = "story.garden",
  src,
  alt,
  ratio,
  fill = false,
  priority = false,
  sizes = "100vw",
  className,
  imageClassName,
}: {
  scene?: SceneKey;
  src?: string;
  alt: string;
  ratio?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
}) {
  if (src) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-photo bg-dune",
          fill ? "absolute inset-0 h-full w-full" : "",
          className,
        )}
        style={fill ? undefined : { aspectRatio: ratio ?? "3 / 2" }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover", imageClassName)}
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative overflow-hidden rounded-photo bg-ink",
        fill ? "absolute inset-0 h-full w-full" : "",
        className,
      )}
      style={fill ? undefined : { aspectRatio: ratio ?? "3 / 2" }}
    >
      <SceneArt scene={scene} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
