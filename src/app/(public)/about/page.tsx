import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

import { ResortImage } from "@/components/brand/resort-image";
import { SectionHeading } from "@/components/brand/section-heading";
import { aboutPage } from "@/content/pages/about";
import { resort } from "@/content/resort";

export const metadata: Metadata = {
  title: "About the resort",
  description: aboutPage.intro,
};

export default function AboutPage() {
  return (
    <>
      <section className="pb-14 pt-32 md:pb-20 md:pt-40">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-sm text-gulf">{aboutPage.eyebrow}</p>
              <h1 className="display-lg mt-5 max-w-[12ch]">{aboutPage.title}</h1>
            </div>
            <div className="lg:col-span-5 lg:pt-12">
              <p className="body-lg text-ink/70">{aboutPage.intro}</p>
            </div>
          </div>
          <div className="mt-12 md:mt-16">
            <ResortImage
              scene="story.garden"
              src="/images/resort/exterior-garden-wide.jpg"
              alt="The Palmyrah Garden and Resort set amidst palmyrah palms in Mannar."
              ratio="21 / 9"
              sizes="100vw"
              priority
            />
            <p className="photo-caption mt-3">The grounds and palmyrah garden at Puthukkudiyiruppu, Mannar.</p>
          </div>
        </div>
      </section>

      <section className="shell py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="The idea" title={aboutPage.story.title} />
          </div>
          <div className="space-y-5 text-ink/70 lg:col-span-7 lg:col-start-6">
            {aboutPage.story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-dune bg-dune/35 py-20 md:py-24">
        <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <ResortImage
              scene="about.weave"
              src="/images/resort/exterior-veranda-trees.jpg"
              alt="The resort veranda shaded beneath mature trees."
              ratio="4 / 5"
              sizes="(min-width: 1024px) 48vw, 100vw"
            />
            <p className="photo-caption mt-3">
              The front veranda set beneath mature native shade trees.
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <SectionHeading title={aboutPage.approach.title} />
            <ul className="mt-8 space-y-4">
              {aboutPage.approach.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-ink/70">
                  <Check
                    className="mt-1 h-4 w-4 shrink-0 text-frond"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-ink/10 pt-5 text-sm text-ink/50">
              The resort is a small, direct operation. There is no call centre between
              you and the person who will meet you at reception.
            </p>
          </div>
        </div>
      </section>

      <section className="shell py-20 md:py-28">
        <SectionHeading title={aboutPage.facilitiesTitle} />
        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {resort.facilities.map((facility) => (
            <div
              key={facility.title}
              className="border-t border-ink/15 pt-5"
            >
              <h3 className="text-base font-semibold">{facility.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{facility.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-dune bg-ink py-20 text-salt md:py-24">
        <div className="shell grid gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-4">
            <h2 className="h2 text-salt">{aboutPage.factsTitle}</h2>
            <Link
              href="/rooms"
              className="link-quiet mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-salt"
            >
              See the rooms
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ul className="divide-y divide-salt/15 border-y border-salt/15 md:col-span-7 md:col-start-6">
            {aboutPage.facts.map((fact) => (
              <li key={fact} className="py-4 text-salt/75">
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
