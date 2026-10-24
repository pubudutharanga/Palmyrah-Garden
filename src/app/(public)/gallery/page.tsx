import type { Metadata } from "next";

import { GalleryGrid } from "@/components/rooms/gallery-grid";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "The garden, the rooms and the coast around The Palmyrah Garden & Resort in Mannar.",
};

export default function GalleryPage() {
  return (
    <>
      <section className="pb-12 pt-32 md:pb-16 md:pt-40">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-sm text-gulf">Looking around</p>
              <h1 className="display-lg mt-5 max-w-[10ch]">The garden, in pieces.</h1>
            </div>
            <div className="lg:col-span-5 lg:pt-12">
              <p className="body-lg text-ink/70">
                Palms, rooms, water and the long light of the north. These are the
                details we would point out if you were standing here.
              </p>
              <p className="mt-5 text-sm text-ink/45">
                Authentic photographs of The Palmyrah Garden &amp; Resort in Mannar,
                showing the rooms, garden grounds, living areas, and guest facilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="shell pb-24 md:pb-32" aria-label="Photographs">
        <GalleryGrid />
      </section>
    </>
  );
}
