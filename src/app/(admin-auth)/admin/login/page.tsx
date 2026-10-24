import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, KeyRound } from "lucide-react";

import { FrontDeskLoginForm } from "@/components/admin/front-desk-login-form";
import { Logo, PalmMark } from "@/components/brand/logo";
import {
  FRONT_DESK_DEMO_PASSWORD,
  FRONT_DESK_DEMO_USERNAME,
} from "@/lib/front-desk";
import { isFrontDeskAuthenticated } from "@/lib/front-desk-session";

export const metadata: Metadata = {
  title: "Front desk sign in",
  description: "Prototype front desk access for Palmyrah Garden.",
  robots: { index: false, follow: false },
};

export default async function FrontDeskLoginPage() {
  if (await isFrontDeskAuthenticated()) {
    redirect("/admin/room-board");
  }

  return (
    <main
      id="main"
      className="relative flex min-h-svh flex-col overflow-hidden bg-salt"
    >
      <PalmMark className="pointer-events-none absolute -right-36 top-16 hidden h-[34rem] w-[34rem] text-ink/[0.035] sm:block sm:-right-24 sm:top-24" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-6 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/"
            className="link-quiet inline-flex shrink-0 items-center gap-1.5 text-sm text-ink/65 transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Guest site
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="w-full max-w-md">
            <p className="inline-flex items-center gap-2 rounded-full border border-jaggery/30 bg-jaggery/[0.08] px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink/75">
              <KeyRound className="h-3.5 w-3.5 text-jaggery" aria-hidden="true" />
              Front desk
            </p>
            <h1 className="h2 mt-5 text-ink">Welcome back.</h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/65">
              Sign in to manage arrivals, rooms and payments.
            </p>

            <div className="mt-8 rounded-panel border border-dune bg-white p-6 shadow-lift sm:p-8">
              <FrontDeskLoginForm />


            </div>

            <p className="mt-5 text-center text-xs text-ink/65">
              Prototype access only. Data stays in this browser.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
