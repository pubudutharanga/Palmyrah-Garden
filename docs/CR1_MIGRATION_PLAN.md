# CR1 migration plan — hourly stays, room board, counter billing

Status: implemented as a localStorage prototype on top of the existing modules 01–03 build.

## Scope and decisions

The change request supersedes the nightly booking model:

- A stay is a UTC interval `[startAt, endAt)` entered in Asia/Colombo.
- Rooms are numbered `01`–`46`, share one standard room type and one price list.
- A guest creates a request; it waits as `pending_approval` until an admin approves it.
- Payment happens at the counter. There is no online payment or deposit page in CR1.
- Inventory is a slot ledger, not a night ledger.

Because Mongo Atlas and Cloudinary credentials are not available yet, this pass uses a
versioned browser store (`palmyrah.prototype.v1`). It is deliberately isolated behind
`src/lib/prototype/store.ts` so the same components can later read from API routes backed by
`RoomSlot`/`Booking` collections. Cloudinary URLs are not faked; generated SVG scenes remain
as the image source until the upload provider is connected.

## Existing files that assume nights

These remain in the repository for the old server-payment path and must not be wired into the
new prototype UI:

| Area | Files |
|---|---|
| Date/night utilities | `src/lib/dates.ts`, `src/lib/dates.test.ts` |
| Nightly pricing | `src/lib/pricing.ts`, `src/lib/pricing.test.ts`, `src/server/services/pricing.ts` |
| Nightly inventory | `src/server/services/availability.ts`, `src/server/demo-occupancy.ts`, `src/server/store/mongo.ts`, `src/server/db/models.ts` |
| Nightly booking service and APIs | `src/server/services/bookings.ts`, `src/app/api/v1/bookings/**`, `src/app/api/v1/availability/**`, `src/app/api/v1/quote/route.ts` |
| Old booking UI | `src/components/booking/booking-bar.tsx`, `booking-flow.tsx`, `booking-confirmation.tsx`, `deposit-payment.tsx`, `stay-calendar.tsx` |
| Old room catalogue | `src/content/rooms.ts` five room types and 100–500 room numbers |

The old APIs and models still typecheck and their tests still pass. They are not linked from
the CR1 routes.

## New prototype layer

| Concern | File |
|---|---|
| Interval/time helpers | `src/lib/prototype/time.ts` |
| Hourly quote and tax | `src/lib/prototype/pricing.ts` |
| Booking, room and document types | `src/lib/prototype/types.ts` |
| Settings (slot, turnaround, rates) | `src/lib/prototype/settings.ts` |
| Status engine, overlap and priority | `src/lib/prototype/status.ts` |
| Pure lifecycle mutations | `src/lib/prototype/engine.ts` |
| Demo seed | `src/lib/prototype/seed.ts` |
| Versioned localStorage adapter | `src/lib/prototype/store.ts` |
| React external-store hooks | `src/lib/prototype/hooks.ts` |
| 46-room catalogue | `src/content/room-board.ts` |

## Route changes

| Route | Change |
|---|---|
| `/rooms` | Replaced by the guest 46-room board. Marketing deep links remain at `/rooms/[slug]` for now. |
| `/book` | Replaced by the hourly request form. |
| `/booking/[ref]` | Replaced by a live request/status page. |
| `/booking/[ref]/pay` | Removed. Payment is at the counter. |
| `/admin/room-board` | New admin board and room drawer. |
| `/admin/bookings/pending` | New approval queue. |
| `/admin/bookings/history` | New filtered history, totals, CSV and print. |
| `/admin/front-desk/check-out/[ref]` | New counter bill, payment and check-out screen. |
| `/admin/billing/documents/[number]/print` | A4/80 mm browser print view. |
| `/admin/billing/documents/[number]/show` | Clean full-screen guest view. |

## Mongo/Atlas migration when credentials arrive

1. Add `RoomSlot` model with a unique `{ roomId, slotStart }` index and TTL on `expiresAt`.
2. Move `engine.ts` operations behind server transactions; the pure functions already
   re-validate the latest state before writing, mirroring the transaction requirement.
3. Map `PendingApproval` to atomic `findOneAndUpdate` state guards.
4. Replace local document counters with transactional counters for `bill`, `receipt` and
   `invoice`.
5. Store Cloudinary URLs on the standard room type; `ResortImage` already accepts the scene
   contract, so only the data source changes.
6. Keep `localStorage` only as an offline queue and clear it after a successful server sync.

## Deliberately simulated in this pass

- Admin auth/RBAC, PII permission checks and audit persistence (local audit log only).
- WhatsApp/email delivery (a local outbox record and `wa.me` fallback are shown).
- PDF rendering and direct thermal printing (browser print / save as PDF is supported).
- Cloudinary uploads.
- POS charges (module 12 was not supplied).
