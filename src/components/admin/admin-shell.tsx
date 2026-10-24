"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  ChevronRight,
  History,
  LayoutGrid,
  LogOut,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { usePrototypeState } from "@/lib/prototype/hooks";
import { resetPrototypeState } from "@/lib/prototype/store";
import { cn } from "@/lib/utils";
import { signOutOfFrontDesk } from "@/server/actions/front-desk";

const NAV = [
  { href: "/admin/room-board", label: "Room board", icon: LayoutGrid },
  { href: "/admin/bookings/pending", label: "Approvals", icon: CalendarClock, pending: true },
  { href: "/admin/bookings/history", label: "Booking history", icon: History },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const state = usePrototypeState();
  const [confirmingReset, setConfirmingReset] = useState(false);

  const pending =
    state?.bookings.filter((booking) => booking.status === "pending_approval").length ?? 0;

  function resetDemo() {
    resetPrototypeState(new Date());
    setConfirmingReset(false);
    toast.success("Demo data reset for this browser.");
  }

  return (
    <div className="min-h-svh bg-salt">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-dune bg-ink text-salt lg:flex print:hidden">
        <div className="border-b border-salt/10 px-6 py-5">
          <Link href="/admin/room-board" aria-label="Palmyrah admin, room board">
            <Logo inverted short />
          </Link>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-salt/50">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Prototype front desk
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-input px-3 text-sm font-medium transition-colors",
                  active ? "bg-salt/10 text-salt" : "text-salt/65 hover:bg-salt/5 hover:text-salt",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
                {item.pending && pending > 0 ? (
                  <span className="tnum ml-auto rounded-full bg-jaggery px-2 py-0.5 text-[11px] font-semibold text-ink">
                    {pending}
                  </span>
                ) : (
                  <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-40" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-salt/10 px-6 py-5 text-xs text-salt/55">
          <p>
            Prototype login. Data is stored in this browser only; Mongo and Cloudinary
            come later.
          </p>
          {confirmingReset ? (
            <span className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={resetDemo}
                className="rounded-full bg-jaggery px-3 py-1.5 font-medium text-ink"
              >
                Yes, reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="rounded-full border border-salt/25 px-3 py-1.5"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="inline-flex items-center gap-1.5 text-salt/70 underline decoration-salt/25 underline-offset-4 hover:text-salt"
            >
              <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset demo data
            </button>
          )}
          <Link href="/rooms" className="block text-salt/70 underline decoration-salt/25 underline-offset-4 hover:text-salt">
            Open the guest site
          </Link>
          <form action={signOutOfFrontDesk}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-salt/70 underline decoration-salt/25 underline-offset-4 hover:text-salt"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-dune bg-ink px-4 py-3 text-salt lg:hidden print:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin/room-board" aria-label="Palmyrah admin, room board">
            <Logo inverted short />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-salt/60 sm:inline">
              Prototype front desk
            </span>
            <form action={signOutOfFrontDesk}>
              <button
                type="submit"
                className="inline-flex min-h-9 items-center gap-1.5 text-xs text-salt/70 transition-colors hover:text-salt"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="mt-3 flex gap-1 overflow-x-auto no-scrollbar" aria-label="Admin mobile">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-medium",
                  active ? "bg-salt text-ink" : "bg-salt/10 text-salt/75",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
                {item.pending && pending > 0 ? (
                  <span className="tnum rounded-full bg-jaggery px-1.5 text-[10px] font-semibold text-ink">
                    {pending}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="lg:pl-72 print:pl-0">{children}</main>
    </div>
  );
}
