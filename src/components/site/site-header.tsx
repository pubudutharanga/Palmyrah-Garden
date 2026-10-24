"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/rooms", label: "Rooms" },
  { href: "/explore", label: "Explore" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = pathname === "/" && !scrolled;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
          overHero
            ? "border-b border-salt/15 bg-transparent text-salt"
            : "border-b border-dune bg-salt/95 text-ink backdrop-blur-md",
        )}
      >
        <div className="shell flex h-20 items-center justify-between gap-6">
          <Link
            href="/"
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gulf"
            aria-label="The Palmyrah Garden & Resort, home"
          >
            <Logo inverted={overHero} short hideLocation className="sm:hidden" />
            <Logo inverted={overHero} className="hidden sm:inline-flex" />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-sm py-2 text-sm transition-colors",
                  overHero ? "text-salt/75 hover:text-salt" : "text-ink/70 hover:text-ink",
                  pathname === item.href
                    ? overHero
                      ? "text-salt"
                      : "text-ink"
                    : "",
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/rooms"
              className={buttonClasses({ size: "md", className: "hidden sm:inline-flex" })}
            >
              Book now
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors lg:hidden",
                overHero
                  ? "border-salt/30 text-salt hover:bg-salt/10"
                  : "border-ink/15 text-ink hover:bg-dune",
              )}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50" />
          <Dialog.Content className="fixed inset-0 z-50 overflow-y-auto bg-salt p-6">
            <div className="flex items-center justify-between">
              <Dialog.Title className="sr-only">Menu</Dialog.Title>
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <Logo />
              </Link>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 hover:bg-dune"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>

            <nav aria-label="Mobile" className="mt-12">
              <ul className="space-y-1">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block border-b border-dune py-4 font-display text-3xl tracking-[-0.02em] text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
