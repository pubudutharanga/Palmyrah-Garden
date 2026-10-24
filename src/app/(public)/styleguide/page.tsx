import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PriceTag } from "@/components/brand/price-tag";
import { ResortImage } from "@/components/brand/resort-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ROOM_CATEGORIES } from "@/content/room-board";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const palette = [
  { name: "Salt", token: "salt", hex: "#F3F5F0", text: "text-ink" },
  { name: "Dune", token: "dune", hex: "#E6E8DF", text: "text-ink" },
  { name: "Ink", token: "ink", hex: "#14261F", text: "text-salt" },
  { name: "Frond", token: "frond", hex: "#3F6B4B", text: "text-salt" },
  { name: "Gulf", token: "gulf", hex: "#2F7A7C", text: "text-salt" },
  { name: "Jaggery", token: "jaggery", hex: "#C08A2E", text: "text-ink" },
] as const;

export default function StyleguidePage() {
  if (process.env.NEXT_PUBLIC_PROTOTYPE_MODE === "false") notFound();

  return (
    <section className="shell pb-24 pt-32 md:pb-32 md:pt-40">
      <p className="text-sm text-gulf">Internal</p>
      <h1 className="display-lg mt-4">Styleguide.</h1>
      <p className="mt-5 max-w-xl text-ink/60">
        The working parts of the interface. This page is not linked from the site and is
        excluded from indexing.
      </p>

      <div className="mt-16 space-y-16">
        <section aria-labelledby="palette">
          <h2 id="palette" className="h2">
            Colour
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {palette.map((colour) => (
              <div
                key={colour.token}
                className={`${colour.text} flex aspect-[4/3] flex-col justify-between rounded-panel border border-ink/10 p-4`}
                style={{ backgroundColor: colour.hex }}
              >
                <p className="text-sm font-medium">{colour.name}</p>
                <div>
                  <p className="tnum text-xs opacity-70">{colour.hex}</p>
                  <p className="text-xs opacity-50">{colour.token}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="type">
          <h2 id="type" className="h2">
            Type
          </h2>
          <div className="mt-6 space-y-6 border-y border-dune py-8">
            <p className="display-lg">Rest in the shade.</p>
            <p className="h1">Built around a tree.</p>
            <p className="h2">Five ways to stay.</p>
            <p className="h3">A quieter north.</p>
            <p className="body measure">
              The palmyrah is the tree of life in the Northern Province. Its leaves roof
              houses and weave baskets; its sap becomes toddy and jaggery.
            </p>
            <p className="small text-ink/60">
              Small text for notes, captions and interface detail.
            </p>
            <p className="caption text-ink/50">
              Caption text. Fraunces for display, Hanken Grotesk for everything else.
            </p>
          </div>
        </section>

        <section aria-labelledby="controls">
          <h2 id="controls" className="h2">
            Controls
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button>Primary action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="available">Available</Badge>
            <Badge tone="held">Held</Badge>
            <Badge tone="booked">Booked</Badge>
            <Badge tone="danger">Error</Badge>
          </div>
          <div className="mt-8 grid max-w-2xl gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="style-name">
              <Input id="style-name" placeholder="Nimali Fernando" />
            </Field>
            <Field label="Email" htmlFor="style-email" hint="We reply in one day.">
              <Input id="style-email" type="email" placeholder="you@example.com" />
            </Field>
            <Field label="Topic" htmlFor="style-topic">
              <Select id="style-topic">
                <option>A stay</option>
                <option>A group</option>
              </Select>
            </Field>
            <Field label="Message" htmlFor="style-message" error="This is an error state.">
              <Textarea id="style-message" placeholder="A note…" />
            </Field>
          </div>
          <div className="mt-6">
            <PriceTag amount={1_850_000} suffix="per 24 h" />
          </div>
        </section>

        <section aria-labelledby="imagery">
          <h2 id="imagery" className="h2">
            Imagery
          </h2>
          <p className="mt-3 max-w-xl text-sm text-ink/55">
            Generated scenes stand in behind a single image seam. Real photography can
            replace any scene without changing layout.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {ROOM_CATEGORIES.flatMap((category) =>
              category.photos.map((photo) => ({
                id: `${category.id}-${photo.src}`,
                photo,
              })),
            ).map(({ id, photo }) => (
              <div key={id}>
                <ResortImage
                  src={photo.src}
                  alt={photo.alt}
                  ratio="4 / 3"
                  sizes="(min-width: 768px) 30vw, 50vw"
                />
                <p className="caption mt-2 text-ink/50">{photo.src}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
