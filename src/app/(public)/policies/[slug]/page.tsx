import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { resort } from "@/content/resort";

const POLICY_SLUGS = ["cancellation", "privacy", "terms"] as const;
type PolicySlug = (typeof POLICY_SLUGS)[number];

type PageProps = { params: Promise<{ slug: string }> };

function isPolicySlug(value: string): value is PolicySlug {
  return (POLICY_SLUGS as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return POLICY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isPolicySlug(slug)) return { title: "Policy not found" };
  const policy = resort.policies[slug];
  return {
    title: policy.title,
    description: policy.intro,
    robots: { index: false, follow: true },
  };
}

export default async function PolicyPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isPolicySlug(slug)) notFound();
  const policy = resort.policies[slug];
  const others = POLICY_SLUGS.filter((item) => item !== slug);

  return (
    <section className="shell pb-24 pt-28 md:pb-32 md:pt-36">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-ink/50">
          <li>
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3 w-3" />
          </li>
          <li className="text-ink/75" aria-current="page">
            {policy.title}
          </li>
        </ol>
      </nav>

      <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <article className="lg:col-span-7">
          <p className="text-sm text-gulf">Policies</p>
          <h1 className="display-lg mt-4">{policy.title}</h1>
          <p className="mt-5 body-lg text-ink/70">{policy.intro}</p>

          <ul className="mt-10 space-y-4 border-t border-ink/10 pt-8">
            {policy.points.map((point) => (
              <li key={point} className="flex gap-4 text-ink/70">
                <span
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-jaggery"
                  aria-hidden="true"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-panel border border-dune bg-dune/35 p-5 text-xs leading-relaxed text-ink/55">
            Prototype content. The property&apos;s reviewed {policy.title.toLowerCase()}{" "}
            will replace this before launch.
          </div>

          <p className="mt-8 text-sm text-ink/55">
            Questions about this policy?{" "}
            <Link href="/contact" className="link-quiet">
              Write to us
            </Link>{" "}
            or email{" "}
            <a href={`mailto:${resort.contact.email}`} className="link-quiet break-all">
              {resort.contact.email}
            </a>
            .
          </p>
        </article>

        <aside className="lg:col-span-3 lg:col-start-10">
          <p className="text-xs uppercase tracking-[0.12em] text-ink/40">Other policies</p>
          <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {others.map((item) => (
              <li key={item}>
                <Link
                  href={`/policies/${item}`}
                  className="flex items-center justify-between gap-4 py-3.5 text-sm text-ink/70 hover:text-ink"
                >
                  {resort.policies[item].title}
                  <ChevronRight className="h-3.5 w-3.5 text-ink/35" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
