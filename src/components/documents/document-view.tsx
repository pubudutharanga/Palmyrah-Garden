import { documentLabel, documentFileName } from "@/lib/prototype/documents";
import { formatLKR } from "@/lib/money";
import { formatColomboDate, formatColomboDateTime } from "@/lib/prototype/time";
import type { PrototypeDocument } from "@/lib/prototype/types";
import { resort } from "@/content/resort";
import { cn } from "@/lib/utils";

export type DocumentFormat = "screen" | "a4" | "thermal";

const METHOD_LABEL: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  bank_transfer: "Bank transfer",
  other: "Other",
};

export function DocumentView({
  doc,
  format = "screen",
}: {
  doc: PrototypeDocument;
  format?: DocumentFormat;
}) {
  const snapshot = doc.snapshot;
  const isThermal = format === "thermal";
  const isBill = doc.type === "BILL";
  const isReceipt = doc.type === "RECEIPT";

  return (
    <article
      className={cn(
        "document-sheet bg-white text-ink",
        format === "a4" &&
          "w-[210mm] min-h-[297mm] p-[14mm] text-[10.5pt] leading-relaxed",
        isThermal && "w-[80mm] p-[5mm] text-[9.5pt] leading-snug",
        format === "screen" &&
          "mx-auto w-full max-w-3xl rounded-sm border border-dune p-6 text-[0.9375rem] shadow-lift sm:p-9",
      )}
    >
      {format !== "screen" ? (
        <style>{`@page { size: ${
          isThermal ? "80mm auto" : "A4"
        }; margin: 0; } @media print { body { margin: 0; } .document-sheet { box-shadow: none !important; } }`}</style>
      ) : null}

      <header className="flex items-start justify-between gap-6 border-b border-ink/25 pb-4">
        <div>
          <p className="font-display text-2xl leading-none">{resort.name}</p>
          <p className="mt-1 text-[0.8em] text-ink/60">{resort.location}</p>
          <p className="text-[0.8em] text-ink/60">{resort.property.email}</p>
          <p className="text-[0.8em] text-ink/50">
            {resort.property.address} · TODO(client)
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.72em] font-semibold uppercase tracking-[0.18em] text-ink/50">
            {documentLabel(doc.type)}
          </p>
          <p className="tnum mt-1 font-semibold">{doc.number}</p>
          <p className="mt-0.5 text-[0.8em] text-ink/60">
            {formatColomboDate(doc.issuedAt)} at {formatColomboDateTime(doc.issuedAt).split(" at ")[1]}
          </p>
          {!doc.isCurrent ? (
            <p className="mt-1 text-[0.72em] font-semibold uppercase tracking-wide text-danger">
              Superseded
            </p>
          ) : null}
        </div>
      </header>

      <section
        className={cn(
          "grid gap-4 border-b border-ink/15 py-4",
          isThermal ? "grid-cols-1" : "grid-cols-2",
        )}
      >
        <div>
          <p className="text-[0.7em] uppercase tracking-[0.12em] text-ink/45">
            Guest
          </p>
          <p className="mt-1 font-medium">{snapshot.guestName}</p>
          <p className="text-[0.9em] text-ink/65">{snapshot.guestPhone}</p>
          <p className="mt-1 text-[0.9em] text-ink/65">
            {snapshot.adults} adults
            {snapshot.children > 0 ? `, ${snapshot.children} child` : ""}
          </p>
        </div>
        <div className={cn(!isThermal && "text-right")}>
          <p className="text-[0.7em] uppercase tracking-[0.12em] text-ink/45">
            Stay
          </p>
          <p className="tnum mt-1 font-medium">Room {snapshot.roomNumber}</p>
          <p className="tnum text-[0.9em] text-ink/65">
            {formatColomboDateTime(snapshot.startAt)}
          </p>
          <p className="tnum text-[0.9em] text-ink/65">
            to {formatColomboDateTime(snapshot.endAt)}
          </p>
          <p className="text-[0.9em] text-ink/65">{snapshot.durationLabel}</p>
        </div>
      </section>

      <section className="py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[0.7em] uppercase tracking-[0.12em] text-ink/45">
            Booking
          </p>
          <p className="tnum text-[0.9em] font-medium">{snapshot.ref}</p>
        </div>

        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink/25">
              <th className="py-1.5 pr-3 text-[0.72em] font-semibold uppercase tracking-[0.08em] text-ink/55">
                Description
              </th>
              {!isThermal ? (
                <th className="w-14 py-1.5 text-right text-[0.72em] font-semibold uppercase tracking-[0.08em] text-ink/55">
                  Qty
                </th>
              ) : null}
              <th className="w-24 py-1.5 text-right text-[0.72em] font-semibold uppercase tracking-[0.08em] text-ink/55">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {snapshot.lines.map((line) => (
              <tr key={`${line.description}-${line.amount}`} className="border-b border-ink/10">
                <td className="py-1.5 pr-3">{line.description}</td>
                {!isThermal ? (
                  <td className="tnum py-1.5 text-right">{line.quantity}</td>
                ) : null}
                <td className="tnum py-1.5 text-right">{formatLKR(line.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-3 space-y-1 text-[0.92em]">
          <div className="flex justify-between gap-4">
            <dt className="text-ink/65">Subtotal</dt>
            <dd className="tnum">{formatLKR(snapshot.subtotal)}</dd>
          </div>
          {snapshot.taxLines.map((line) => (
            <div key={line.code} className="flex justify-between gap-4">
              <dt className="text-ink/65">
                {line.label} {line.percent}%
              </dt>
              <dd className="tnum">{formatLKR(line.amount)}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-ink/25 pt-1.5 font-semibold">
            <dt>Total</dt>
            <dd className="tnum">{formatLKR(snapshot.total)}</dd>
          </div>
          {snapshot.payments.length > 0 ? (
            <>
              <div className="flex justify-between gap-4">
                <dt className="text-ink/65">Paid</dt>
                <dd className="tnum">{formatLKR(snapshot.paid)}</dd>
              </div>
              <div className="flex justify-between gap-4 font-semibold">
                <dt>Balance due</dt>
                <dd className="tnum">{formatLKR(snapshot.balance)}</dd>
              </div>
            </>
          ) : null}
        </dl>
      </section>

      {snapshot.payments.length > 0 ? (
        <section className="border-t border-ink/15 py-4">
          <p className="text-[0.7em] uppercase tracking-[0.12em] text-ink/45">
            Payments
          </p>
          <table className="mt-2 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-ink/20">
                <th className="py-1 text-[0.72em] font-semibold text-ink/55">Receipt</th>
                <th className="py-1 text-[0.72em] font-semibold text-ink/55">Date</th>
                <th className="py-1 text-[0.72em] font-semibold text-ink/55">Method</th>
                <th className="py-1 text-right text-[0.72em] font-semibold text-ink/55">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {snapshot.payments.map((payment) => (
                <tr key={payment.id} className="border-b border-ink/10">
                  <td className="tnum py-1 pr-2">{payment.receiptNumber}</td>
                  <td className="py-1 pr-2">{formatColomboDate(payment.createdAt)}</td>
                  <td className="py-1 pr-2 capitalize">
                    {METHOD_LABEL[payment.method] ?? payment.method}
                  </td>
                  <td className="tnum py-1 text-right">{formatLKR(payment.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <footer className="border-t border-ink/25 pt-3 text-[0.78em] leading-relaxed text-ink/60">
        {isBill ? (
          <p>
            This is a bill, not a receipt. Please settle at the front desk. Payment
            can be made by cash, card or bank transfer.
          </p>
        ) : isReceipt ? (
          <p>Payment received with thanks. Keep this receipt for your records.</p>
        ) : (
          <p>
            Final invoice for the stay above. Thank you for staying at {resort.name}.
          </p>
        )}
        <p className="mt-2">
          Sample rates and tax figures — TODO(client). {documentFileName(doc)}
        </p>
        <p>
          {resort.property.legalName} · TIN {resort.property.tin} · VAT{" "}
          {resort.property.vatRegNo}
        </p>
      </footer>
    </article>
  );
}
