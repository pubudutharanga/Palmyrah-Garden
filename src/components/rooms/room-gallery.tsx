"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ResortImage } from "@/components/brand/resort-image";
import type { RoomImage } from "@/content/rooms";
import { cn } from "@/lib/utils";

export function RoomGallery({
  images,
  name,
}: {
  images: RoomImage[];
  name: string;
}) {
  const [index, setIndex] = useState(0);
  const current = images[index];
  if (!current) return null;

  const go = (next: number) => {
    setIndex((next + images.length) % images.length);
  };

  return (
    <div aria-roledescription="carousel" aria-label={`${name} gallery`}>
      <div className="group relative overflow-hidden rounded-photo bg-ink">
        <ResortImage
          scene={current.scene}
          src={current.src}
          alt={current.alt}
          ratio="3 / 2"
          sizes="(min-width: 1024px) 64vw, 100vw"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/60 to-transparent p-4">
          <p className="max-w-[60%] text-xs text-salt/80">{current.alt}</p>
          <div className="flex items-center gap-1.5">
            <span className="tnum mr-1 text-xs text-salt/70">
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-salt/90 text-ink transition-colors hover:bg-salt"
              aria-label="Previous photograph"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-salt/90 text-ink transition-colors hover:bg-salt"
              aria-label="Next photograph"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {images.map((image, imageIndex) => (
          <button
            key={`${image.src ?? image.scene}-${imageIndex}`}
            type="button"
            onClick={() => setIndex(imageIndex)}
            aria-label={`Show photograph ${imageIndex + 1}: ${image.alt}`}
            aria-current={imageIndex === index ? "true" : undefined}
            className={cn(
              "overflow-hidden rounded-photo border-2 transition-opacity",
              imageIndex === index
                ? "border-frond opacity-100"
                : "border-transparent opacity-65 hover:opacity-100",
            )}
          >
            <ResortImage
              scene={image.scene}
              src={image.src}
              alt=""
              ratio="4 / 3"
              sizes="(min-width: 1024px) 20vw, 33vw"
            />
          </button>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        Photograph {index + 1} of {images.length}. {current.alt}
      </p>
    </div>
  );
}
