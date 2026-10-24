import type { Metadata } from "next";
import { Suspense } from "react";

import { RequestForm } from "@/components/booking/request-form";

export const metadata: Metadata = {
  title: "Request a room",
  description: "Request a room for a few hours or a longer stay and pay at the counter.",
};

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="shell py-12">
          <div className="h-10 w-64 animate-pulse rounded bg-dune/70" />
          <div className="mt-6 h-96 max-w-2xl animate-pulse rounded-panel bg-dune/50" />
        </div>
      }
    >
      <RequestForm />
    </Suspense>
  );
}
