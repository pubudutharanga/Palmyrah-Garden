"use client";

import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { BedDouble, Ruler, Users, X } from "lucide-react";

import { STATUS_META } from "@/components/board/status-meta";
import { ResortImage } from "@/components/brand/resort-image";
import { Button, buttonClasses } from "@/components/ui/button";
import { getRoomCategory, type BoardRoom } from "@/content/room-board";
import { formatLKR } from "@/lib/money";
import { quoteInterval } from "@/lib/prototype/pricing";
import { PROTOTYPE_SETTINGS } from "@/lib/prototype/settings";
import {
  formatColomboDateTime,
  formatDuration,
  type Period,
} from "@/lib/prototype/time";
import type { BoardRoomStatus } from "@/lib/prototype/types";
import { cn } from "@/lib/utils";

export function GuestRoomDialog({
  room,
  status,
  period,
  now,
  onClose,
  onShowFree,
}: {
  room: BoardRoom;
  status: BoardRoomStatus;
  period: Period;
  now: number;
  onClose: () => void;
  onShowFree: () => void;
}) {
  const meta = STATUS_META[status.status];
  const Icon = meta.icon;
  const available = status.status === "available";
  const category = getRoomCategory(room.number);
  const pricing = PROTOTYPE_SETTINGS.pricing[category?.id ?? "non_ac"];

  let quote = null;
  if (available) {
    try {
      quote = quoteInterval({
        startAt: period.startAt,
        endAt: period.endAt,
        roomNumber: room.number,
        now: new Date(now),
      });
    } catch {
      quote = null;
    }
  }

  const requestHref = `/book?room=${room.number}&from=${encodeURIComponent(
    period.startAt,
  )}&to=${encodeURIComponent(period.endAt)}&preset=${period.preset}`;

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[92svh] overflow-y-auto rounded-t-panel border border-dune bg-salt p-5 shadow-lift outline-none sm:bottom-6 sm:left-auto sm:right-6 sm:top-24 sm:w-[min(92vw,580px)] sm:rounded-panel sm:p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink/45">Room</p>
              <Dialog.Title className="tnum font-display text-4xl leading-none">
                {room.number}
              </Dialog.Title>
              <p className="mt-2 text-sm text-ink/60">
                {room.wing} · {category?.label ?? "Room"} · {room.bedType} bed ·{" "}
                {room.sizeSqm} m²
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 hover:bg-dune"
                aria-label="Close room details"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {room.photos.map((photo) => (
              <ResortImage
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                ratio="4 / 3"
                sizes="(min-width: 640px) 240px, 45vw"
              />
            ))}
          </div>
          <p className="photo-caption mt-2 text-xs text-ink/45">
            Sample room photography; each room&apos;s own photos still to come.
            TODO(client).
          </p>

          <div
            className={cn(
              "mt-5 flex items-center gap-2 rounded-input px-3 py-2 text-sm font-medium",
              meta.tile,
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {meta.label}
            {status.status === "pending" ? " · awaiting confirmation" : null}
            {status.status === "booked" && status.availableAgainAt ? (
              <span className="opacity-85">
                · free again {formatColomboDateTime(status.availableAgainAt)}
              </span>
            ) : null}
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-4 border-y border-dune py-4 text-sm">
            <div>
              <dt className="flex items-center gap-1.5 text-ink/45">
                <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
                Beds
              </dt>
              <dd className="mt-1 font-medium">
                {room.bedCount} {room.bedType.toLowerCase()}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-ink/45">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                Sleeps
              </dt>
              <dd className="mt-1 font-medium">
                {room.maxAdults} adults, {room.maxChildren} child
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-ink/45">
                <Ruler className="h-3.5 w-3.5" aria-hidden="true" />
                Size
              </dt>
              <dd className="mt-1 font-medium">{room.sizeSqm} m²</dd>
            </div>
          </dl>

          <ul className="mt-4 grid gap-1.5 text-sm text-ink/70 sm:grid-cols-2">
            {room.amenities.map((amenity) => (
              <li key={amenity} className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-frond" aria-hidden="true" />
                {amenity}
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-panel border border-dune bg-dune/30 p-4">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-ink/45">
                  {available ? "For this window" : "Sample rate"}
                </p>
                <p className="mt-1 text-sm text-ink/65">
                  {formatColomboDateTime(period.startAt)} to{" "}
                  {formatColomboDateTime(period.endAt)} ·{" "}
                  {formatDuration(
                    Math.max(
                      0,
                      (new Date(period.endAt).getTime() -
                        new Date(period.startAt).getTime()) /
                        60_000,
                    ),
                  )}
                </p>
              </div>
              {quote ? (
                <p className="tnum shrink-0 text-right font-display text-2xl">
                  {formatLKR(quote.total)}
                  <span className="block text-xs font-sans font-normal text-ink/50">
                    incl. taxes
                  </span>
                </p>
              ) : null}
            </div>

            {quote ? (
              <ul className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-xs text-ink/60">
                {quote.lines.map((line) => (
                  <li key={line.description} className="flex justify-between gap-4">
                    <span>{line.description}</span>
                    <span className="tnum">{formatLKR(line.amount)}</span>
                  </li>
                ))}
                {quote.taxLines.map((line) => (
                  <li key={line.code} className="flex justify-between gap-4">
                    <span>
                      {line.label} {line.percent}%
                    </span>
                    <span className="tnum">{formatLKR(line.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink/60">
                LKR{" "}
                {(pricing.ratePer24h / 100).toLocaleString("en-GB")} per 24 hours, then
                LKR{" "}
                {(pricing.ratePerHour / 100).toLocaleString("en-GB")} per extra hour,
                plus 10% service charge and 18% VAT. Sample rate — TODO(client).
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {available ? (
              <Link href={requestHref} className={buttonClasses({ className: "flex-1" })}>
                Request this room
              </Link>
            ) : (
              <>
                <Button type="button" disabled className="flex-1">
                  Not free for this window
                </Button>
                <Button type="button" variant="secondary" onClick={onShowFree}>
                  Show free rooms
                </Button>
              </>
            )}
          </div>
          <p className="mt-3 text-xs text-ink/50">
            No payment is taken now. The resort confirms your request, then you pay at
            the counter.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
