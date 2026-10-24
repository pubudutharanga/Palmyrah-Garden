"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";

type CategoryKey = "all" | "garden" | "bedrooms" | "living" | "bathrooms";

type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
  category: "garden" | "bedrooms" | "living" | "bathrooms";
  span: string;
  ratio: string;
};

const items: GalleryItem[] = [
  {
    src: "/images/resort/exterior-cottage-front.jpg",
    alt: "The Palmyrah Garden and Resort main villa with tiled roof, veranda, and surrounding palms in Mannar.",
    caption: "Main villa and covered veranda amidst lush palmyrah palms.",
    category: "garden",
    span: "col-span-12 sm:col-span-8",
    ratio: "16 / 11",
  },
  {
    src: "/images/resort/family-room-two-queen-beds.jpg",
    alt: "Family Room with two queen beds under air conditioning.",
    caption: "Family Room with two queen beds and air conditioning.",
    category: "bedrooms",
    span: "col-span-12 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/living-room-sofa.jpg",
    alt: "Modern L-shaped sectional sofa and wooden coffee table in the lounge.",
    caption: "Comfortable sectional seating in the guest lounge.",
    category: "living",
    span: "col-span-6 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/bathroom-bidet-sink.jpg",
    alt: "Private bathroom with pedestal washbasin, mirror and bidet spray.",
    caption: "Private bathroom with bidet, washbasin and toiletries.",
    category: "bathrooms",
    span: "col-span-6 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/exterior-garden-lawn.jpg",
    alt: "Shaded garden lawn looking towards the resort cottage through native trees.",
    caption: "Tranquil garden lawn with dappled shade beneath old trees.",
    category: "garden",
    span: "col-span-12 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/family-bedroom-garden-view.jpg",
    alt: "Spacious family bedroom with beds and sitting table beside garden windows.",
    caption: "Family bedroom with sitting corner and generous natural light.",
    category: "bedrooms",
    span: "col-span-12 sm:col-span-7",
    ratio: "16 / 11",
  },
  {
    src: "/images/resort/living-armchairs-cane.jpg",
    alt: "Traditional cane-backed armchairs with batik cushions.",
    caption: "Hand-crafted cane armchairs and quiet relaxation corner.",
    category: "living",
    span: "col-span-6 sm:col-span-5",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/exterior-veranda-trees.jpg",
    alt: "Front veranda of the resort villa with pillars and garden trees.",
    caption: "The covered veranda framing the garden entrance.",
    category: "garden",
    span: "col-span-6 sm:col-span-5",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/family-room-crib-cot.jpg",
    alt: "Wooden baby crib/cot, extra single bed, and drying rack in family room.",
    caption: "Baby crib available free upon request for traveling families.",
    category: "bedrooms",
    span: "col-span-12 sm:col-span-7",
    ratio: "16 / 11",
  },
  {
    src: "/images/resort/dining-table-seating.jpg",
    alt: "Dining table with wooden chairs in the guest living quarters.",
    caption: "Dining area for in-house breakfast and family meals.",
    category: "living",
    span: "col-span-6 sm:col-span-4",
    ratio: "1 / 1",
  },
  {
    src: "/images/resort/exterior-cottage-side.jpg",
    alt: "Side view of the resort cottage under blue sky with palms.",
    caption: "Cottage architecture designed for northern coastal cross-breeze.",
    category: "garden",
    span: "col-span-6 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/bedroom-queen-red.jpg",
    alt: "Wooden queen bed with nightstand and green rug.",
    caption: "Cozy wooden queen bed with garden outlook.",
    category: "bedrooms",
    span: "col-span-12 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/exterior-garden-wide.jpg",
    alt: "Wide view of the resort grounds, natural soil path and palmyrah trees.",
    caption: "Wide garden grounds shaded by palmyrah and fruit trees.",
    category: "garden",
    span: "col-span-12 sm:col-span-8",
    ratio: "16 / 10",
  },
  {
    src: "/images/resort/living-hall-overview.jpg",
    alt: "Spacious central living hall with sectional sofa and cane seating.",
    caption: "Central living hall connecting rooms and common areas.",
    category: "living",
    span: "col-span-6 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/bathroom-pedestal-sink.jpg",
    alt: "Clean ensuite bathroom with pedestal sink, toilet and bidet.",
    caption: "Ensuite bathroom with modern fittings and bidet sprayer.",
    category: "bathrooms",
    span: "col-span-6 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/family-beds-throws.jpg",
    alt: "Two queen beds with blue and maroon throws in family room.",
    caption: "Comfortable bedding with fresh linens and warm throws.",
    category: "bedrooms",
    span: "col-span-6 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/bedroom-single-desk.jpg",
    alt: "Single wooden bed with round tea table and chair.",
    caption: "Single bed with convenient writing table and chair.",
    category: "bedrooms",
    span: "col-span-6 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/living-area-sectional.jpg",
    alt: "Sectional sofa and wooden coffee table in relaxing common room.",
    caption: "Relaxed indoor lounge for quiet reading and gatherings.",
    category: "living",
    span: "col-span-12 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/family-room-two-beds-ac.jpg",
    alt: "Family room with two beds and air conditioner.",
    caption: "Air-conditioned family room with bedside reading table.",
    category: "bedrooms",
    span: "col-span-12 sm:col-span-6",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/family-room-three-beds.jpg",
    alt: "Multiple wooden beds arranged in family room.",
    caption: "Multiple beds for group stays and family visits.",
    category: "bedrooms",
    span: "col-span-6 sm:col-span-6",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/bedroom-natural-light.jpg",
    alt: "Bedroom with morning sunlight streaming through wooden windows.",
    caption: "Bright morning sunlight through wooden sash windows.",
    category: "bedrooms",
    span: "col-span-6 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/hallway-entrance-view.jpg",
    alt: "Private entrance doorway with wooden door and mats.",
    caption: "Private entrance and corridor leading to the rooms.",
    category: "living",
    span: "col-span-6 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/bedroom-dresser-mirror.jpg",
    alt: "Solid wood vanity dresser with full-height mirror and drawers.",
    caption: "Solid wood dressing table with mirror and storage drawers.",
    category: "bedrooms",
    span: "col-span-6 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/family-bedroom-ac-mirror.jpg",
    alt: "Family bedroom showing AC, dressing table and wooden beds.",
    caption: "Modern air-conditioning unit and wooden furnishings.",
    category: "bedrooms",
    span: "col-span-6 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/family-room-overview.jpg",
    alt: "Wide angle of family room showing wooden beds and vanity.",
    caption: "Family room layout with natural ventilation and cooling.",
    category: "bedrooms",
    span: "col-span-6 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/bedroom-queen-ac.jpg",
    alt: "Queen size wooden bed with grey linens and AC.",
    caption: "Queen bed with solid teak headboard and soft linens.",
    category: "bedrooms",
    span: "col-span-6 sm:col-span-4",
    ratio: "4 / 3",
  },
  {
    src: "/images/resort/family-bedroom-beds.jpg",
    alt: "Family bedroom beds and reading lamp beside window.",
    caption: "Comfortable beds with reading lamp beside garden window.",
    category: "bedrooms",
    span: "col-span-12 sm:col-span-4",
    ratio: "4 / 3",
  },
];

const categories: { key: CategoryKey; label: string }[] = [
  { key: "all", label: "All Photos" },
  { key: "garden", label: "Garden & Grounds" },
  { key: "bedrooms", label: "Bedrooms" },
  { key: "living", label: "Living & Lounge" },
  { key: "bathrooms", label: "Bathrooms" },
];

export function GalleryGrid() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [active, setActive] = useState<number | null>(null);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const current = active === null ? null : filteredItems[active];

  const go = (direction: number) => {
    setActive((index) => {
      if (index === null) return index;
      return (index + direction + filteredItems.length) % filteredItems.length;
    });
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const count =
            cat.key === "all"
              ? items.length
              : items.filter((item) => item.category === cat.key).length;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.key);
                setActive(null);
              }}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                isSelected
                  ? "bg-ink text-salt shadow-sm"
                  : "border border-ink/15 bg-transparent text-ink/70 hover:bg-dune/60 hover:text-ink",
              )}
            >
              {cat.label} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-3 sm:gap-4">
        {filteredItems.map((item, index) => (
          <button
            key={`${item.src}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "group relative block cursor-zoom-in overflow-hidden rounded-photo bg-dune text-left",
              item.span,
            )}
            style={{ aspectRatio: item.ratio }}
            aria-label={`Open photograph: ${item.alt}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 via-ink/35 to-transparent p-3 text-xs text-salt/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
              {item.caption}
            </span>
          </button>
        ))}
      </div>

      <Dialog.Root
        open={active !== null}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed inset-x-0 top-1/2 z-50 mx-auto w-[min(94vw,1180px)] -translate-y-1/2 outline-none"
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") go(-1);
              if (event.key === "ArrowRight") go(1);
            }}
          >
            <Dialog.Title className="sr-only">Photograph from the gallery</Dialog.Title>
            <Dialog.Description className="sr-only">
              Use the previous and next buttons to move through the gallery. Press Escape
              to close.
            </Dialog.Description>

            {current ? (
              <div>
                <div
                  className="relative mx-auto overflow-hidden rounded-photo bg-dune"
                  style={{ aspectRatio: "16 / 10", maxHeight: "78vh" }}
                >
                  <Image
                    src={current.src}
                    alt={current.alt}
                    fill
                    sizes="94vw"
                    priority
                    className="object-contain sm:object-cover"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 text-salt">
                  <div>
                    <p className="text-sm text-salt/85">{current.caption}</p>
                    <p className="mt-0.5 text-xs text-salt/50">
                      Photo {(active ?? 0) + 1} of {filteredItems.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-salt/30 text-salt hover:bg-salt/10"
                      aria-label="Previous photograph"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-salt/30 text-salt hover:bg-salt/10"
                      aria-label="Next photograph"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute -top-14 right-0 inline-flex h-11 w-11 items-center justify-center rounded-full border border-salt/30 text-salt hover:bg-salt/10"
                aria-label="Close gallery"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
