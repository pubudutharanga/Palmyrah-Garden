import Link from "next/link";
import {
  ArrowUpRight,
  BatteryCharging,
  CarFront,
  Church,
  Coffee,
  MapPin,
  Phone,
  PlugZap,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { ResortImage } from "@/components/brand/resort-image";
import { SectionHeading } from "@/components/brand/section-heading";
import { HomeHero } from "@/components/home/home-hero";
import { buttonClasses } from "@/components/ui/button";
import { home } from "@/content/pages/home";
import { nearbyPlaces, resort } from "@/content/resort";
import { ROOM_CATEGORIES } from "@/content/room-board";
import { formatLKR } from "@/lib/money";
import { PROTOTYPE_SETTINGS } from "@/lib/prototype/settings";
import { formatDuration } from "@/lib/prototype/time";

const places = ["madhu", "vankalai", "baobab"]
  .map((id) => nearbyPlaces.find((place) => place.id === id))
  .filter((place): place is (typeof nearbyPlaces)[number] => Boolean(place));

/** Icons paired in order with home.ev.features. */
const EV_FEATURES = [
  BatteryCharging,
  ShieldCheck,
  Coffee,
  PlugZap,
  Church,
  CarFront,
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  name: resort.name,
  description: resort.summary,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Mannar",
    addressRegion: "Northern Province",
    addressCountry: "LK",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: resort.property.coordinates.lat,
    longitude: resort.property.coordinates.lng,
  },
  numberOfRooms: 46,
  starRating: {
    "@type": "Rating",
    ratingValue: "7",
    bestRating: "10",
  },
  checkinTime: "15:00",
  checkoutTime: "11:00",
  petsAllowed: false,
  smokingAllowed: false,
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Free private parking", value: true },
    { "@type": "LocationFeatureSpecification", name: "Halal breakfast", value: true },
    { "@type": "LocationFeatureSpecification", name: "Air conditioning", value: true },
    { "@type": "LocationFeatureSpecification", name: "Private bathroom", value: true },
    { "@type": "LocationFeatureSpecification", name: "Garden", value: true },
    { "@type": "LocationFeatureSpecification", name: "Family rooms", value: true },
  ],
  containsPlace: [
    {
      "@type": "HotelRoom",
      name: "Air-conditioned room",
      description:
        "Air-conditioned room with ceiling fan, private bathroom with hot water, tea and coffee, and Wi-Fi.",
      bed: { "@type": "BedDetails", numberOfBeds: 1, typeOfBed: "King bed" },
    },
    {
      "@type": "HotelRoom",
      name: "Non-AC room",
      description:
        "Garden-side room with ceiling fan, high windows, private bathroom with hot water, tea and coffee, and Wi-Fi.",
      bed: { "@type": "BedDetails", numberOfBeds: 1, typeOfBed: "King bed" },
    },
  ],
  priceRange: `${formatLKR(
    PROTOTYPE_SETTINGS.pricing.non_ac.ratePer24h,
  )}–${formatLKR(PROTOTYPE_SETTINGS.pricing.ac.ratePer24h)} per 24 hours`,
};

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <section className="shell pb-24 pt-24 md:pb-32 md:pt-32">
        <div className="grid items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <ResortImage
              scene="story.garden"
              src="/images/resort/exterior-cottage-front.jpg"
              alt="The Palmyrah Garden and Resort main villa and tranquil lawn in Mannar."
              ratio="4 / 5"
              sizes="(min-width: 768px) 48vw, 100vw"
            />
            <p className="photo-caption mt-3">The Palmyrah Garden and Resort, Puthukkudiyiruppu, Mannar.</p>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <SectionHeading title={home.story.title} />
            <div className="mt-6 space-y-5 text-ink/70">
              {home.story.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <Link
              href="/about"
              className="link-quiet mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink"
            >
              {home.story.linkLabel}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="rooms" className="border-y border-dune bg-dune/45 py-24 md:py-28">
        <div className="shell">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="The rooms"
              title={home.rooms.title}
              intro={home.rooms.intro}
            />
            <Link
              href="/rooms"
              className="link-quiet inline-flex shrink-0 items-center gap-1.5 text-sm font-medium"
            >
              {home.rooms.linkLabel}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-14 space-y-16 lg:space-y-24">
            {ROOM_CATEGORIES.map((category, index) => {
              const rate = PROTOTYPE_SETTINGS.pricing[category.id];
              return (
                <article
                  key={category.id}
                  className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12"
                >
                  <div
                    className={`lg:col-span-7 ${
                      index === 1 ? "lg:order-2" : ""
                    }`}
                  >
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      {category.photos.map((photo) => (
                        <ResortImage
                          key={photo.src}
                          src={photo.src}
                          alt={photo.alt}
                          ratio="4 / 5"
                          sizes="(min-width: 1024px) 28vw, 30vw"
                        />
                      ))}
                    </div>
                    <p className="photo-caption mt-3">
                      Real room photography. Exact shots for each room still to come.
                      TODO(client).
                    </p>
                  </div>

                  <div className="lg:col-span-5">
                    <p className="text-xs uppercase tracking-[0.12em] text-ink/45">
                      {category.label}
                    </p>
                    <h3 className="mt-3 font-display text-3xl">{category.tagline}</h3>
                    <p className="mt-4 text-ink/70">{category.description}</p>
                    <ul className="mt-6 grid gap-2 text-sm text-ink/65">
                      {category.amenities.map((amenity) => (
                        <li key={amenity} className="flex items-start gap-2">
                          <span
                            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-frond"
                            aria-hidden="true"
                          />
                          {amenity}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7 rounded-panel border border-ink/10 bg-salt/60 p-5">
                      <p className="text-xs uppercase tracking-[0.1em] text-ink/45">
                        Sample rate
                      </p>
                      <p className="tnum mt-1 font-display text-3xl">
                        {formatLKR(rate.ratePer24h)}
                        <span className="ml-2 font-sans text-sm font-normal text-ink/55">
                          per 24 hours
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-ink/55">
                        Then {formatLKR(rate.ratePerHour)} per extra hour, plus service
                        charge and VAT. TODO(client).
                      </p>
                      <Link
                        href={category.href}
                        className={buttonClasses({ size: "sm", className: "mt-4" })}
                      >
                        {category.ctaLabel}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-salt py-24 md:py-32">
        <div className="shell relative grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionHeading
              eyebrow="Mannar"
              title={home.mannar.title}
              intro={home.mannar.intro}
            />
            <Link
              href="/explore"
              className="link-quiet mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink"
            >
              {home.mannar.linkLabel}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="md:col-span-8">
            <div className="group">
              <Link href={`/explore#${places[0].id}`} className="block">
                <ResortImage
                  scene={places[0].scene}
                  src={places[0].src}
                  alt={places[0].name}
                  ratio="16 / 9"
                  sizes="(min-width: 768px) 58vw, 100vw"
                  imageClassName="transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="mt-5 flex items-baseline justify-between gap-6">
                  <div>
                    <h3 className="font-display text-2xl tracking-[-0.02em] group-hover:text-jaggery">
                      {places[0].name}
                    </h3>
                    <p className="mt-1 max-w-xl text-sm text-ink/65">{places[0].intro}</p>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-ink/35"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </div>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {places.slice(1).map((place) => (
                <Link key={place.id} href={`/explore#${place.id}`} className="group block">
                  <ResortImage
                    scene={place.scene}
                    src={place.src}
                    alt={place.name}
                    ratio="4 / 3"
                    sizes="(min-width: 768px) 28vw, 100vw"
                    imageClassName="transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <h3 className="mt-4 font-display text-xl tracking-[-0.015em] group-hover:text-jaggery">
                    {place.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink/65">{place.intro}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-24 md:py-28">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading title={home.gallery.title} />
          <Link
            href="/gallery"
            className="link-quiet inline-flex shrink-0 items-center gap-1.5 text-sm font-medium"
          >
            {home.gallery.linkLabel}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-12 gap-4 sm:gap-5">
          <Link href="/gallery" className="group col-span-12 block sm:col-span-5">
            <ResortImage
              scene="gallery.1"
              src="/images/resort/exterior-garden-lawn.jpg"
              alt="Lush green garden and native palmyrah palms at the resort."
              ratio="4 / 5"
              sizes="(min-width: 640px) 40vw, 100vw"
              imageClassName="transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </Link>
          <Link
            href="/gallery"
            className="group col-span-6 mt-8 block sm:col-span-4 sm:mt-20"
          >
            <ResortImage
              scene="gallery.4"
              src="/images/resort/family-bedroom-garden-view.jpg"
              alt="Family bedroom with large windows facing the garden."
              ratio="3 / 4"
              sizes="(min-width: 640px) 32vw, 50vw"
              imageClassName="transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </Link>
          <Link
            href="/gallery"
            className="group col-span-6 mt-16 block sm:col-span-3 sm:mt-36"
          >
            <ResortImage
              scene="gallery.3"
              src="/images/resort/living-room-sofa.jpg"
              alt="Relaxing lounge area with comfortable sectional sofa."
              ratio="1 / 1"
              sizes="(min-width: 640px) 24vw, 50vw"
              imageClassName="transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </Link>
        </div>
      </section>

      <section
        id="ev-charging"
        className="border-t border-dune bg-salt py-24 md:py-32"
      >
        <div className="shell">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-jaggery/30 bg-jaggery/[0.08] px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-ink/75">
                <Zap className="h-3.5 w-3.5 text-jaggery" aria-hidden="true" />
                {home.ev.eyebrow}
              </p>
              <h2 className="h2 mt-6 max-w-[15ch] text-ink">{home.ev.title}</h2>
              <p className="body mt-5 max-w-xl text-ink/70">{home.ev.intro}</p>
              <p className="mt-5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gulf">
                {home.ev.tagline}
              </p>

              <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {home.ev.features.map((feature, index) => {
                  const Icon = EV_FEATURES[index] ?? Zap;
                  return (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-jaggery/25 bg-jaggery/10 text-jaggery">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm leading-relaxed text-ink/75">
                        {feature}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mx-auto w-full max-w-[600px] lg:col-span-6 lg:max-w-none">
              <figure className="relative overflow-hidden rounded-panel border border-dune">
                <ResortImage
                  src={home.ev.photo.src}
                  alt={home.ev.photo.alt}
                  ratio="1 / 1"
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="rounded-none"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/50 to-transparent px-5 pb-4 pt-20">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-jaggery px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-ink">
                    <Zap className="h-3 w-3" aria-hidden="true" />
                    {home.ev.photo.badge}
                  </span>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-salt/90">
                      <MapPin
                        className="h-3.5 w-3.5 text-salt/70"
                        aria-hidden="true"
                      />
                      {home.ev.photo.captionLeft}
                    </span>
                    <span className="text-salt/65">
                      {home.ev.photo.captionRight}
                    </span>
                  </div>
                </figcaption>
              </figure>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-6 border-t border-dune pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-jaggery"
                aria-hidden="true"
              />
              <div>
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink/45">
                  {home.ev.location.label}
                </p>
                <p className="mt-1 text-sm font-medium text-ink">
                  {home.ev.location.hotel}
                </p>
                <p className="mt-0.5 text-sm text-ink/55">
                  {home.ev.location.brand}
                </p>
              </div>
            </div>
            <a
              href={home.ev.phone.href}
              aria-label={`Call Palmyrah Garden on ${home.ev.phone.label}`}
              className={buttonClasses({ size: "lg", className: "shrink-0" })}
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {home.ev.phone.label}
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-dune py-20">
        <div className="shell">
          <h2 className="sr-only">{home.practical.title}</h2>
          <div className="grid gap-10 md:grid-cols-3 md:gap-12">
            <div>
              <h3 className="text-sm font-semibold text-ink">{home.practical.arrival.title}</h3>
              <p className="mt-3 text-sm text-ink/65">{resort.gettingHere.paragraphs[0]}</p>
              <Link
                href="/contact"
                className="link-quiet mt-4 inline-flex items-center gap-1.5 text-sm text-ink"
              >
                {home.practical.arrival.linkLabel}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">{home.practical.times.title}</h3>
              <dl className="mt-3 space-y-2 text-sm text-ink/65">
                <div className="flex items-baseline justify-between gap-6 border-b border-dune pb-2">
                  <dt>Shortest window</dt>
                  <dd className="tnum font-medium text-ink">
                    {formatDuration(PROTOTYPE_SETTINGS.stay.minMinutes)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-6 border-b border-dune pb-2">
                  <dt>Longest window</dt>
                  <dd className="tnum font-medium text-ink">
                    {formatDuration(PROTOTYPE_SETTINGS.stay.maxMinutes)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-6">
                  <dt>Request held for</dt>
                  <dd className="tnum font-medium text-ink">
                    {formatDuration(PROTOTYPE_SETTINGS.stay.approvalTimeoutMinutes)}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">{home.practical.contact.title}</h3>
              <p className="mt-3 text-sm text-ink/65">{home.practical.contact.body}</p>
              <Link
                href="/contact"
                className="link-quiet mt-4 inline-flex items-center gap-1.5 text-sm text-ink"
              >
                {home.practical.contact.linkLabel}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
