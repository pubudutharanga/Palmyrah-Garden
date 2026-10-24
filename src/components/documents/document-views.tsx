"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

import { DocumentView, type DocumentFormat } from "@/components/documents/document-view";
import { buttonClasses } from "@/components/ui/button";
import { findDocument } from "@/lib/prototype/documents";
import { usePrototypeState } from "@/lib/prototype/hooks";

function DocumentMissing() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <p className="text-sm text-gulf">Document</p>
      <h1 className="h1 mt-2">Not found.</h1>
      <p className="mt-3 text-ink/65">
        This document is not in the local prototype ledger, or the link belongs to
        another booking.
      </p>
      <Link href="/rooms" className={buttonClasses({ className: "mt-6" })}>
        Open the room board
      </Link>
    </div>
  );
}

export function DocumentScreen({
  number,
  bookingRef,
  backHref,
  backLabel = "Back",
}: {
  number: string;
  bookingRef?: string;
  backHref: string;
  backLabel?: string;
}) {
  const state = usePrototypeState();
  if (!state) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="h-[60vh] animate-pulse rounded bg-dune/60" />
      </div>
    );
  }

  const found = findDocument(state, number);
  if (!found || (bookingRef && found.booking.ref !== bookingRef)) {
    return <DocumentMissing />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 print:px-0 print:py-0">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="link-quiet inline-flex items-center gap-1.5 text-sm text-ink/60"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {backLabel}
        </Link>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/admin/billing/documents/${number}/print?format=a4`}
            target="_blank"
            rel="noreferrer"
            className={buttonClasses({ variant: "secondary", size: "sm" })}
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            A4 print / PDF
          </a>
          <a
            href={`/admin/billing/documents/${number}/print?format=80mm`}
            target="_blank"
            rel="noreferrer"
            className={buttonClasses({ variant: "secondary", size: "sm" })}
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            80 mm receipt
          </a>
        </div>
      </div>
      <DocumentView doc={found.document} />
    </div>
  );
}

export function PrintDocument({
  number,
  format,
  backHref,
}: {
  number: string;
  format: DocumentFormat;
  backHref: string;
}) {
  const state = usePrototypeState();
  if (!state) {
    return <div className="p-10 text-sm text-ink/55">Preparing the document…</div>;
  }

  const found = findDocument(state, number);
  if (!found) return <DocumentMissing />;

  return (
    <div className="min-h-svh bg-dune/40 px-2 py-4 print:min-h-0 print:bg-white print:p-0">
      <div className="no-print mx-auto mb-4 flex max-w-3xl flex-wrap items-center justify-between gap-2">
        <Link
          href={backHref}
          className="link-quiet inline-flex items-center gap-1.5 text-sm text-ink/60"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to the document
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/billing/documents/${number}/print?format=a4`}
            className={buttonClasses({
              variant: format === "a4" ? "primary" : "secondary",
              size: "sm",
            })}
          >
            A4
          </Link>
          <Link
            href={`/admin/billing/documents/${number}/print?format=80mm`}
            className={buttonClasses({
              variant: format === "thermal" ? "primary" : "secondary",
              size: "sm",
            })}
          >
            80 mm
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className={buttonClasses({ size: "sm" })}
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            Print / save PDF
          </button>
        </div>
      </div>
      <div className="mx-auto w-fit max-w-full overflow-x-auto shadow-lift print:shadow-none">
        <DocumentView doc={found.document} format={format} />
      </div>
      <p className="no-print mx-auto mt-4 max-w-3xl text-center text-xs text-ink/50">
        In the browser print dialog, choose “Save as PDF” for a PDF copy. The
        80 mm view is sized for a thermal receipt printer.
      </p>
    </div>
  );
}
