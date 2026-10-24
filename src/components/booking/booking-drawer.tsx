"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { BookingBar } from "@/components/booking/booking-bar";
import { Button } from "@/components/ui/button";
import { resort } from "@/content/resort";

export function BookingDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button size="md" className="hidden sm:inline-flex">
          Book now
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/55 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-dune bg-salt p-6 shadow-lift sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="h2">Plan your stay</Dialog.Title>
              <Dialog.Description className="mt-3 text-sm text-ink/60">
                Choose your dates. We will show you what is free across the five
                wings. {resort.stay.checkInTime} check-in, {resort.stay.checkOutTime}{" "}
                check-out.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink hover:bg-dune"
                aria-label="Close booking"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-8">
            <BookingBar
              variant="stack"
              onSubmitted={() => setOpen(false)}
            />
          </div>

          <div className="mt-8 border-t border-dune pt-6 text-sm text-ink/60">
            <p>
              Booking more than five rooms, or planning a group? Write to{" "}
              <a
                href={`mailto:${resort.contact.email}`}
                className="text-gulf underline decoration-gulf/30 underline-offset-4"
              >
                {resort.contact.email}
              </a>
              .
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
