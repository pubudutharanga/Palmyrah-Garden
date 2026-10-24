"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  BedDouble,
  Check,
  ChevronDown,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { z } from "zod";

import { BookingBar } from "@/components/booking/booking-bar";
import { ResortImage } from "@/components/brand/resort-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Textarea } from "@/components/ui/field";
import { MEAL_PLANS, type MealPlan } from "@/lib/constants";
import { ROOM_TYPE_BY_ID, type SceneKey } from "@/content/rooms";
import { resort } from "@/content/resort";
import { diffNights, formatDateRange, type DateKey } from "@/lib/dates";
import { formatLKR } from "@/lib/money";
import { distributeGuests } from "@/lib/occupancy";
import { guestSummary, roomSummary } from "@/lib/stay";
import { rememberBooking } from "@/lib/booking-session";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { guestDetailsSchema } from "@/lib/validators/booking";
import type { BookingRecord, Quote, SearchTypeResult } from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = "rooms" | "details";
type PaymentChoice = "pay_at_resort" | "deposit";

type StayInput = {
  checkIn: DateKey;
  checkOut: DateKey;
  adults: number;
  children: number;
  rooms: number;
  roomType?: string;
};

type RoomOption = SearchTypeResult & {
  scene?: SceneKey;
  src?: string;
  tagline: string;
  summary: string;
  sizeSqm: number;
  bedding: string;
};

type BookingCreateResponse = {
  ref: string;
  token: string;
  booking: BookingRecord;
};

const guestFormSchema = guestDetailsSchema.extend({
  acceptTerms: z.boolean().refine((value) => value === true, {
    message: "Please accept the booking and cancellation terms.",
  }),
});

type GuestFormValues = z.infer<typeof guestFormSchema>;

function initialSelection(
  types: SearchTypeResult[],
  stay: StayInput,
): Record<string, number> {
  const selection: Record<string, number> = {};
  let remaining = stay.rooms;

  const preferred = stay.roomType
    ? types.find((type) => type.slug === stay.roomType && type.available > 0)
    : undefined;

  if (preferred) {
    const take = Math.min(preferred.available, remaining);
    if (take > 0) {
      selection[preferred.roomTypeId] = take;
      remaining -= take;
    }
  }

  for (const type of types) {
    if (remaining <= 0) break;
    if (type.available <= 0 || selection[type.roomTypeId]) continue;
    const take = Math.min(type.available, remaining);
    selection[type.roomTypeId] = take;
    remaining -= take;
  }

  return selection;
}

export function BookingFlow({
  stay,
  types,
}: {
  stay: StayInput;
  types: SearchTypeResult[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("rooms");
  const [selection, setSelection] = useState<Record<string, number>>(() =>
    initialSelection(types, stay),
  );
  const [mealPlan, setMealPlan] = useState<MealPlan>("RO");
  const [payment, setPayment] = useState<PaymentChoice>("pay_at_resort");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const nights = diffNights(stay.checkIn, stay.checkOut);
  const roomOptions = types.flatMap((type) => {
    const content = ROOM_TYPE_BY_ID.get(type.roomTypeId);
    if (!content) return [];
    return [
      {
        ...type,
        scene: content.images[0].scene,
        src: content.images[0].src,
        tagline: content.tagline,
        summary: content.summary,
        sizeSqm: content.sizeSqm,
        bedding: content.bedding,
      } satisfies RoomOption,
    ];
  });

  const selectedEntries = Object.entries(selection).filter(([, quantity]) => quantity > 0);
  const selectedCount = selectedEntries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const selectedTypeIds = selectedEntries.map(([id]) => id);

  const distribution = useMemo(() => {
    const slots = Object.entries(selection)
      .filter(([, quantity]) => quantity > 0)
      .flatMap(([roomTypeId, quantity]) => {
        const content = ROOM_TYPE_BY_ID.get(roomTypeId);
        if (!content) return [];
        return Array.from({ length: quantity }, () => ({
          roomTypeId,
          maxAdults: content.maxAdults,
          maxChildren: content.maxChildren,
          maxOccupancy: content.maxOccupancy,
        }));
      });
    return distributeGuests(slots, stay.adults, stay.children);
  }, [selection, stay.adults, stay.children]);

  const quoteQuery = useQuery({
    queryKey: [
      "booking-quote",
      stay.checkIn,
      stay.checkOut,
      mealPlan,
      selectedTypeIds,
      selectedEntries.map(([, quantity]) => quantity),
      stay.adults,
      stay.children,
    ],
    queryFn: () => {
      if (!distribution.ok) throw new Error(distribution.message);
      return apiRequest<Quote>("/api/v1/quote", {
        method: "POST",
        body: JSON.stringify({
          checkIn: stay.checkIn,
          checkOut: stay.checkOut,
          mealPlan,
          rooms: distribution.rooms,
        }),
      });
    },
    enabled: selectedCount > 0 && distribution.ok,
    staleTime: 30_000,
    retry: 1,
  });

  const quote = distribution.ok ? quoteQuery.data : undefined;
  const quoteReady =
    Boolean(quote) && !quoteQuery.isFetching && !quoteQuery.isError && distribution.ok;
  const quoteError = quoteQuery.error instanceof Error ? quoteQuery.error.message : null;

  function changeQuantity(roomTypeId: string, delta: number) {
    setSelection((current) => {
      const next = { ...current };
      const value = (next[roomTypeId] ?? 0) + delta;
      if (value <= 0) delete next[roomTypeId];
      else next[roomTypeId] = value;
      return next;
    });
    setSubmitError(null);
  }

  function goToDetails() {
    if (!quoteReady) return;
    setStep("details");
    setSubmitError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToRooms() {
    setStep("rooms");
    setSubmitError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      notes: "",
      acceptTerms: false,
    },
  });

  async function submitBooking(values: GuestFormValues) {
    setSubmitError(null);
    if (!quoteReady || !distribution.ok) {
      setSubmitError("Wait for the price to finish updating, then try again.");
      return;
    }
    if (!values.acceptTerms) return;

    try {
      const result = await apiRequest<BookingCreateResponse>("/api/v1/bookings", {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          checkIn: stay.checkIn,
          checkOut: stay.checkOut,
          mealPlan,
          adults: stay.adults,
          children: stay.children,
          rooms: selectedEntries.map(([roomTypeId, quantity]) => ({
            roomTypeId,
            quantity,
          })),
          guest: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone || undefined,
            country: values.country || undefined,
            notes: values.notes || undefined,
          },
          payment,
          acceptTerms: true,
        }),
      });

      rememberBooking(result.ref, result.booking, result.token);
      const suffix = `?t=${encodeURIComponent(result.token)}`;
      if (payment === "deposit") {
        router.push(`/booking/${result.ref}/pay${suffix}`);
      } else {
        router.push(`/booking/${result.ref}${suffix}&new=1`);
      }
    } catch (error) {
      setSubmitError(
        error instanceof ApiClientError
          ? error.message
          : "We could not confirm the booking. Please try again.",
      );
    }
  }

  const noRooms = roomOptions.every((type) => type.available <= 0);
  const requestedShort =
    selectedCount > 0 && selectedCount < stay.rooms && !noRooms;

  return (
    <>
      <div className="shell pb-28 pt-8 md:pt-10 lg:pb-16">
        <div className="flex flex-col gap-5 border-b border-dune pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-gulf">Direct booking</p>
            <h1 className="h1 mt-2">
              {step === "rooms" ? "Choose your rooms." : "Who is staying?"}
            </h1>
          </div>
          <ChangeStay stay={stay} />
        </div>

        <ol className="mt-5 flex items-center gap-3 text-sm" aria-label="Booking steps">
          <li
            className={cn(
              "inline-flex items-center gap-2",
              step === "rooms" ? "font-medium text-ink" : "text-ink/45",
            )}
            aria-current={step === "rooms" ? "step" : undefined}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                step === "rooms" ? "bg-ink text-salt" : "border border-ink/20 text-ink/50",
              )}
            >
              1
            </span>
            Rooms
          </li>
          <li className="h-px w-8 bg-ink/15" aria-hidden="true" />
          <li
            className={cn(
              "inline-flex items-center gap-2",
              step === "details" ? "font-medium text-ink" : "text-ink/45",
            )}
            aria-current={step === "details" ? "step" : undefined}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                step === "details" ? "bg-ink text-salt" : "border border-ink/20 text-ink/50",
              )}
            >
              2
            </span>
            Guest details
          </li>
        </ol>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7 xl:col-span-8">
            {step === "rooms" ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <p className="text-sm text-ink/60">
                    {formatDateRange(stay.checkIn, stay.checkOut)}. {nights}{" "}
                    {nights === 1 ? "night" : "nights"}, {guestSummary(stay.adults, stay.children)}.
                  </p>
                  <p className="text-sm text-ink/45">
                    {selectedCount > 0
                      ? `${roomSummary(selectedCount)} selected`
                      : "Select a room"}
                  </p>
                </div>

                {noRooms ? (
                  <EmptyState
                    title="No rooms for these dates."
                    body="The dates you chose are full. Change your dates, or send us a note and we will suggest an alternative."
                    action={
                      <div className="flex flex-wrap justify-center gap-3">
                        <Button asChild variant="secondary" size="sm">
                          <Link href="/#plan-your-stay">Change dates</Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href="/contact">Send an enquiry</Link>
                        </Button>
                      </div>
                    }
                  />
                ) : null}

                {requestedShort ? (
                  <div className="rounded-input border border-jaggery/40 bg-jaggery/[0.07] px-4 py-3 text-sm text-ink/70">
                    You asked for {roomSummary(stay.rooms)}, but only {roomSummary(selectedCount)}{" "}
                    {selectedCount === 1 ? "is" : "are"} free for these dates. Adjust the
                    rooms below, or go back and change the search.
                  </div>
                ) : null}

                {roomOptions.map((type) => {
                  const quantity = selection[type.roomTypeId] ?? 0;
                  const soldOut = type.available <= 0;
                  const canAdd = !soldOut && selectedCount < 5 && quantity < type.available;
                  const canRemove = quantity > 0;
                  return (
                    <article
                      key={type.roomTypeId}
                      className={cn(
                        "rounded-panel border p-4 transition-colors sm:p-5",
                        quantity > 0
                          ? "border-frond/45 bg-frond/[0.04]"
                          : "border-dune bg-salt",
                        soldOut && "opacity-70",
                      )}
                    >
                      <div className="flex gap-4 sm:gap-5">
                        <div className="w-24 shrink-0 sm:w-40">
                          <ResortImage
                            scene={type.scene}
                            src={type.src}
                            alt={`${type.name} at The Palmyrah Garden`}
                            ratio="4 / 3"
                            sizes="(min-width: 640px) 160px, 96px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h2 className="font-display text-xl leading-tight tracking-[-0.015em]">
                                {type.name}
                              </h2>
                              <p className="mt-1 text-xs text-ink/50">{type.tagline}</p>
                            </div>
                            {soldOut ? (
                              <Badge tone="booked">Fully booked</Badge>
                            ) : (
                              <Badge tone="available">
                                {type.available} {type.available === 1 ? "room" : "rooms"} free
                              </Badge>
                            )}
                          </div>
                          <p className="mt-2 hidden text-sm leading-relaxed text-ink/60 sm:block">
                            {type.summary}
                          </p>
                          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/50">
                            <span>{type.sizeSqm} m²</span>
                            <span>{type.bedding}</span>
                            <span>Sleeps {type.maxOccupancy}</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-4">
                        <div>
                          <p className="tnum text-sm font-semibold">
                            {formatLKR(type.fromRate)}
                            <span className="ml-1 text-xs font-normal text-ink/45">
                              per room, per night
                            </span>
                          </p>
                          <p className="mt-0.5 text-[11px] text-ink/40">
                            Before service charge and VAT
                          </p>
                        </div>

                        {soldOut ? null : (
                          <div
                            className="flex items-center gap-1"
                            role="group"
                            aria-label={`${type.name} quantity`}
                          >
                            <button
                              type="button"
                              onClick={() => changeQuantity(type.roomTypeId, -1)}
                              disabled={!canRemove}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 hover:bg-dune disabled:opacity-30"
                              aria-label={`Remove a ${type.name}`}
                            >
                              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <span className="tnum w-8 text-center text-sm font-medium" aria-live="polite">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => changeQuantity(type.roomTypeId, 1)}
                              disabled={!canAdd}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 hover:bg-dune disabled:opacity-30"
                              aria-label={`Add a ${type.name}`}
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}

                <div className="pt-2">
                  <h2 className="h3">Meals</h2>
                  <p className="mt-1 text-sm text-ink/55">
                    Choose a meal plan for the whole stay. You can also decide at the
                    resort, subject to availability.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {(Object.entries(MEAL_PLANS) as [MealPlan, (typeof MEAL_PLANS)[MealPlan]][]).map(
                      ([code, plan]) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setMealPlan(code)}
                          aria-pressed={mealPlan === code}
                          className={cn(
                            "rounded-input border px-4 py-3 text-left transition-colors",
                            mealPlan === code
                              ? "border-frond bg-frond/[0.06]"
                              : "border-ink/15 hover:border-ink/30",
                          )}
                        >
                          <span className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium">{plan.label}</span>
                            {mealPlan === code ? (
                              <Check className="h-4 w-4 text-frond" aria-hidden="true" />
                            ) : null}
                          </span>
                          <span className="mt-1 block text-xs text-ink/50">
                            {code === "RO"
                              ? "No meals included"
                              : `+${formatLKR(plan.adultPerNight)} per adult, per night`}
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <p className="pt-1 text-xs leading-relaxed text-ink/45">
                  A 10% service charge and 18% VAT are added to the room and meal
                  charges. The final total is shown before you confirm.
                </p>
              </div>
            ) : (
              <form
                id="guest-details-form"
                onSubmit={handleSubmit(submitBooking)}
                noValidate
                className="space-y-8"
              >
                <button
                  type="button"
                  onClick={goToRooms}
                  className="inline-flex items-center gap-1.5 text-sm text-ink/55 hover:text-ink"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Back to rooms
                </button>

                <section aria-labelledby="guest-heading">
                  <h2 id="guest-heading" className="h3">
                    The lead guest
                  </h2>
                  <p className="mt-1 text-sm text-ink/55">
                    We use these details for the booking and arrival.
                  </p>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <Field
                      label="First name"
                      htmlFor="booking-first-name"
                      error={errors.firstName?.message}
                    >
                      <Input
                        id="booking-first-name"
                        autoComplete="given-name"
                        aria-invalid={Boolean(errors.firstName)}
                        aria-describedby={
                          errors.firstName ? "booking-first-name-error" : undefined
                        }
                        {...register("firstName")}
                      />
                    </Field>
                    <Field
                      label="Last name"
                      htmlFor="booking-last-name"
                      error={errors.lastName?.message}
                    >
                      <Input
                        id="booking-last-name"
                        autoComplete="family-name"
                        aria-invalid={Boolean(errors.lastName)}
                        aria-describedby={
                          errors.lastName ? "booking-last-name-error" : undefined
                        }
                        {...register("lastName")}
                      />
                    </Field>
                    <Field
                      label="Email"
                      htmlFor="booking-email"
                      error={errors.email?.message}
                    >
                      <Input
                        id="booking-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "booking-email-error" : undefined}
                        {...register("email")}
                      />
                    </Field>
                    <Field
                      label="Phone (optional)"
                      htmlFor="booking-phone"
                      error={errors.phone?.message}
                    >
                      <Input
                        id="booking-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? "booking-phone-error" : undefined}
                        {...register("phone")}
                      />
                    </Field>
                    <Field
                      label="Country (optional)"
                      htmlFor="booking-country"
                      error={errors.country?.message}
                    >
                      <Input
                        id="booking-country"
                        autoComplete="country-name"
                        {...register("country")}
                      />
                    </Field>
                  </div>
                </section>

                <section aria-labelledby="notes-heading" className="border-t border-dune pt-8">
                  <h2 id="notes-heading" className="h3">
                    Anything we should know?
                  </h2>
                  <p className="mt-1 text-sm text-ink/55">
                    Arrival time, dietary needs, a quiet room. Optional.
                  </p>
                  <div className="mt-5">
                    <Field
                      label="Notes for the resort"
                      htmlFor="booking-notes"
                      error={errors.notes?.message}
                    >
                      <Textarea
                        id="booking-notes"
                        className="min-h-28"
                        placeholder="We expect to arrive around 16:00."
                        {...register("notes")}
                      />
                    </Field>
                  </div>
                </section>

                <section aria-labelledby="payment-heading" className="border-t border-dune pt-8">
                  <h2 id="payment-heading" className="h3">
                    Payment
                  </h2>
                  <p className="mt-1 text-sm text-ink/55">
                    No real card payment is taken in this prototype.
                  </p>
                  <fieldset className="mt-5 grid gap-2 sm:grid-cols-2">
                    <legend className="sr-only">Payment choice</legend>
                    {(
                      [
                        {
                          value: "pay_at_resort" as const,
                          title: "Pay at the resort",
                          body: "Settle the full amount on arrival.",
                        },
                        {
                          value: "deposit" as const,
                          title: "Pay a deposit now",
                          body: "A demonstration payment page follows. No card details are requested.",
                        },
                      ] satisfies { value: PaymentChoice; title: string; body: string }[]
                    ).map((option) => (
                      <label
                        key={option.value}
                        className={cn(
                          "flex cursor-pointer gap-3 rounded-input border p-4 transition-colors",
                          payment === option.value
                            ? "border-frond bg-frond/[0.05]"
                            : "border-ink/15 hover:border-ink/30",
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={option.value}
                          checked={payment === option.value}
                          onChange={() => setPayment(option.value)}
                          className="mt-1 h-4 w-4 accent-[var(--frond)]"
                        />
                        <span>
                          <span className="block text-sm font-medium">{option.title}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-ink/55">
                            {option.body}
                          </span>
                          {option.value === "deposit" && quote ? (
                            <span className="tnum mt-1.5 block text-xs font-medium text-ink">
                              {formatLKR(quote.depositDue)} now
                            </span>
                          ) : null}
                        </span>
                      </label>
                    ))}
                  </fieldset>
                </section>

                <section aria-labelledby="terms-heading" className="border-t border-dune pt-8">
                  <h2 id="terms-heading" className="sr-only">
                    Terms
                  </h2>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/65">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--frond)]"
                      aria-invalid={Boolean(errors.acceptTerms)}
                      {...register("acceptTerms")}
                    />
                    <span>
                      I have read and accept the{" "}
                      <a
                        href="/policies/terms"
                        target="_blank"
                        rel="noreferrer"
                        className="link-quiet text-ink"
                      >
                        booking terms
                      </a>{" "}
                      and the{" "}
                      <a
                        href="/policies/cancellation"
                        target="_blank"
                        rel="noreferrer"
                        className="link-quiet text-ink"
                      >
                        cancellation policy
                      </a>
                      .
                    </span>
                  </label>
                  {errors.acceptTerms?.message ? (
                    <p className="mt-2 text-sm text-danger" role="alert">
                      {errors.acceptTerms.message}
                    </p>
                  ) : null}
                </section>

                {submitError ? (
                  <div className="rounded-input border border-danger/30 bg-danger/[0.06] px-4 py-3 text-sm text-danger" role="alert">
                    {submitError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-4 border-t border-dune pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-sm text-xs leading-relaxed text-ink/45">
                    Your booking is confirmed when a reference is issued. You will see
                    it on the next screen and can save or print it.
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !quoteReady}
                    className="shrink-0"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Confirming…
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Confirm booking
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-6">
              <SummaryCard
                stay={stay}
                nights={nights}
                selectedCount={selectedCount}
                distributionError={
                  selectedCount > 0 && !distribution.ok ? distribution.message : null
                }
                quote={quote}
                quoteLoading={quoteQuery.isFetching && !quoteQuery.isError}
                quoteError={quoteError}
                onRetry={() => void quoteQuery.refetch()}
                payment={payment}
                step={step}
                canContinue={quoteReady}
                onContinue={goToDetails}
                isSubmitting={isSubmitting}
              />
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-dune bg-salt/95 p-3 backdrop-blur lg:hidden">
        <div className="shell flex items-center justify-between gap-3 px-0">
          <div className="min-w-0">
            <p className="text-[11px] text-ink/45">
              {step === "rooms" ? "Total including taxes" : "Due"}
            </p>
            <p className="tnum truncate text-sm font-semibold">
              {quote
                ? formatLKR(
                    step === "details" && payment === "deposit"
                      ? quote.depositDue
                      : quote.total,
                  )
                : "Calculating…"}
            </p>
          </div>
          {step === "rooms" ? (
            <Button onClick={goToDetails} disabled={!quoteReady} className="shrink-0">
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              form="guest-details-form"
              disabled={isSubmitting || !quoteReady}
              className="shrink-0"
            >
              {isSubmitting ? "Confirming…" : "Confirm"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

function ChangeStay({ stay }: { stay: StayInput }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full sm:max-w-xl">
      <Button variant="secondary" size="sm" onClick={() => setOpen((value) => !value)}>
        {open ? "Close" : "Change dates or guests"}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </Button>
      {open ? (
        <div className="mt-4 rounded-panel border border-dune bg-dune/25 p-3">
          <BookingBar
            variant="bar"
            initial={{
              checkIn: stay.checkIn,
              checkOut: stay.checkOut,
              adults: stay.adults,
              children: stay.children,
              rooms: stay.rooms,
            }}
            roomType={stay.roomType}
          />
          <p className="mt-2 px-2 text-xs text-ink/45">
            Changing the search will reload the room list.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({
  stay,
  nights,
  selectedCount,
  distributionError,
  quote,
  quoteLoading,
  quoteError,
  onRetry,
  payment,
  step,
  canContinue,
  onContinue,
  isSubmitting,
}: {
  stay: StayInput;
  nights: number;
  selectedCount: number;
  distributionError: string | null;
  quote: Quote | undefined;
  quoteLoading: boolean;
  quoteError: string | null;
  onRetry: () => void;
  payment: PaymentChoice;
  step: Step;
  canContinue: boolean;
  onContinue: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="rounded-panel border border-dune bg-dune/30 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="h3">Your stay</h2>
          <p className="mt-1 text-sm text-ink/55">
            {formatDateRange(stay.checkIn, stay.checkOut)}
          </p>
        </div>
        <BedDouble className="mt-1 h-5 w-5 shrink-0 text-frond" aria-hidden="true" />
      </div>

      <dl className="mt-5 space-y-2 border-y border-ink/10 py-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink/50">Nights</dt>
          <dd className="tnum font-medium">{nights}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink/50">Guests</dt>
          <dd className="text-right font-medium">
            {guestSummary(stay.adults, stay.children)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink/50">Rooms</dt>
          <dd className="tnum font-medium">
            {selectedCount > 0 ? roomSummary(selectedCount) : "None yet"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink/50">Check-in</dt>
          <dd className="font-medium">from {resort.stay.checkInTime}</dd>
        </div>
      </dl>

      {distributionError ? (
        <p className="mt-4 rounded-input border border-danger/30 bg-danger/[0.06] px-3 py-2 text-sm text-danger" role="alert">
          {distributionError}
        </p>
      ) : null}

      <div className="mt-4" aria-live="polite">
        {quoteError ? (
          <div className="rounded-input border border-danger/30 bg-danger/[0.06] px-3 py-2 text-sm text-danger">
            <p>{quoteError}</p>
            <button
              type="button"
              onClick={onRetry}
              className="link-quiet mt-2 text-xs font-medium"
            >
              Try the price again
            </button>
          </div>
        ) : quote ? (
          <div className="space-y-2 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-ink/60">
                {quote.lines.some((line) => line.type === "MEAL_PLAN")
                  ? "Rooms and meals"
                  : "Rooms"}
              </p>
              <p className="tnum">{formatLKR(quote.subtotal)}</p>
            </div>
            {quote.taxLines.map((tax) => (
              <div
                key={tax.code}
                className="flex items-baseline justify-between gap-4 text-ink/60"
              >
                <p>
                  {tax.label} ({tax.percent}%)
                </p>
                <p className="tnum">{formatLKR(tax.amount)}</p>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 border-t border-ink/15 pt-3">
              <p className="font-medium">Total</p>
              <p className="tnum text-base font-semibold">{formatLKR(quote.total)}</p>
            </div>
            {payment === "deposit" ? (
              <div className="flex items-baseline justify-between gap-4 text-ink/60">
                <p>Deposit due now ({quote.depositPercent}%)</p>
                <p className="tnum font-medium text-ink">{formatLKR(quote.depositDue)}</p>
              </div>
            ) : (
              <div className="flex items-baseline justify-between gap-4 text-ink/50">
                <p>Due at the resort</p>
                <p className="tnum">{formatLKR(quote.total)}</p>
              </div>
            )}
            {quoteLoading ? (
              <p className="pt-1 text-xs text-ink/45">Updating the price…</p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2" aria-label="Calculating price">
            <div className="h-4 w-32 animate-pulse rounded bg-ink/10" />
            <div className="h-4 w-24 animate-pulse rounded bg-ink/10" />
            <div className="h-4 w-28 animate-pulse rounded bg-ink/10" />
            <p className="pt-1 text-xs text-ink/45">
              {selectedCount === 0 ? "Select a room to see the price." : "Calculating…"}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 hidden lg:block">
        {step === "rooms" ? (
          <Button onClick={onContinue} disabled={!canContinue} className="w-full" size="lg">
            Continue to guest details
          </Button>
        ) : (
          <Button
            type="submit"
            form="guest-details-form"
            disabled={isSubmitting || !canContinue}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Confirming…" : "Confirm booking"}
          </Button>
        )}
      </div>

      <p className="mt-4 flex items-start gap-1.5 text-xs leading-relaxed text-ink/45">
        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-frond" aria-hidden="true" />
        Free cancellation until {resort.stay.freeCancellationHours} hours before
        arrival.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-ink/40">
        All amounts are quoted and charged in Sri Lankan rupees.
      </p>
    </div>
  );
}
