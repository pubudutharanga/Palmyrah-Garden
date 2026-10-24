import type { PrototypeBooking, PrototypeDocument, PrototypeState } from "@/lib/prototype/types";

export function findDocument(
  state: PrototypeState,
  number: string,
): { booking: PrototypeBooking; document: PrototypeDocument } | null {
  for (const booking of state.bookings) {
    const document = booking.documents.find((item) => item.number === number);
    if (document) return { booking, document };
  }
  return null;
}

export function currentBill(booking: PrototypeBooking): PrototypeDocument | undefined {
  return booking.documents.find(
    (document) => document.type === "BILL" && document.isCurrent,
  );
}

export function documentLabel(type: PrototypeDocument["type"]): string {
  if (type === "BILL") return "Bill";
  if (type === "RECEIPT") return "Payment receipt";
  return "Final invoice";
}

export function documentFileName(document: PrototypeDocument): string {
  const guest = document.snapshot.guestName
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  return `${document.number}${guest ? `-${guest}` : ""}.pdf`;
}
