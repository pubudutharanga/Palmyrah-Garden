"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, ChevronDown } from "lucide-react";

import { ResortImage } from "@/components/brand/resort-image";
import { buttonClasses } from "@/components/ui/button";
import { home } from "@/content/pages/home";
import { cn } from "@/lib/utils";

const SLIDE_INTERVAL_MS = 7_000;

export function HomeHero() {
  const reducedMotion = useReducedMotion();
  const animate = !reducedMotion;
  const photos = home.hero.photos;

  const [index, setIndex] = useState(0);
  const [documentHidden, setDocumentHidden] = useState(false);

  useEffect(() => {
    const onVisibilityChange = () =>
      setDocumentHidden(document.visibilityState === "hidden");
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (reducedMotion || documentHidden || photos.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % photos.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reducedMotion, documentHidden, photos.length]);

  const { scrollY } = useScroll();
  const parallax = useTransform(scrollY, [0, 800], [0, 46]);

  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden bg-ink text-salt">
      <motion.div
        className="absolute inset-0 scale-[1.06]"
        initial={animate ? { scale: 1.06 } : false}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: [0.2, 0.7, 0.2, 1] }}
        style={reducedMotion ? undefined : { y: parallax }}
      >
        {photos.map((photo, photoIndex) => (
          <div
            key={photo.src}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
              photoIndex === index ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={photoIndex === index ? undefined : true}
          >
            <ResortImage
              src={photo.src}
              alt={photo.alt}
              fill
              priority={photoIndex === 0}
              sizes="100vw"
              className="rounded-none"
            />
          </div>
        ))}
      </motion.div>

      {/* Centered scrims: keep the garden visible, keep the welcome legible. */}
      <div className="absolute inset-0 bg-ink/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/25 to-ink/85" />
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, transparent 30%, rgba(12, 26, 21, 0.42) 100%)",
        }}
      />

      <div className="shell relative flex w-full flex-col items-center py-28 text-center md:py-32">
        <motion.p
          className="flex items-center justify-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-salt/70"
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="h-px w-8 bg-salt/35" aria-hidden="true" />
          {home.hero.place}
          <span className="h-px w-8 bg-salt/35" aria-hidden="true" />
        </motion.p>

        <h1 className="display-xl mx-auto mt-7 max-w-[22ch] text-balance text-salt">
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              initial={animate ? { y: "110%" } : false}
              animate={{ y: 0 }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {home.hero.headline}
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              initial={animate ? { y: "110%" } : false}
              animate={{ y: 0 }}
              transition={{ duration: 0.75, delay: 0.23, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {home.hero.headlineSuffix}
            </motion.span>
          </span>
        </h1>

        <motion.p
          className="body-lg mx-auto mt-7 max-w-[46ch] text-salt/80"
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {home.hero.intro}
        </motion.p>

        <motion.div
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
          initial={animate ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          <Link href="/rooms" className={buttonClasses({ size: "lg" })}>
            Find your room
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>

        <motion.div
          className="mt-10 flex items-center justify-center gap-2"
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          role="group"
          aria-label="Hero photos"
        >
          {photos.map((photo, photoIndex) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setIndex(photoIndex)}
              aria-label={`Show photo ${photoIndex + 1} of ${photos.length}`}
              aria-current={photoIndex === index ? "true" : undefined}
              className={cn(
                "h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salt focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
                photoIndex === index
                  ? "w-8 bg-salt"
                  : "w-2 bg-salt/40 hover:bg-salt/70",
              )}
            />
          ))}
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block"
        initial={animate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      >
        <motion.a
          href="#rooms"
          aria-label="Scroll to the rooms"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-salt/25 bg-ink/40 text-salt/75 backdrop-blur-sm transition-colors hover:bg-ink/60 hover:text-salt"
          animate={reducedMotion ? undefined : { y: [0, 6, 0] }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.6,
          }}
        >
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </motion.a>
      </motion.div>
    </section>
  );
}
