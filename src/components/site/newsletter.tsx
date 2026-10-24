"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!consent) {
      setError("Please tick the box to confirm you would like the letter.");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/v1/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consent: true,
          source: "footer",
          website: "",
        }),
      });
      const body = (await response.json()) as
        | { ok: true }
        | { ok: false; error: { message: string } };
      if (!body.ok) throw new Error(body.error.message);
      setStatus("done");
    } catch (caught) {
      setStatus("idle");
      setError(
        caught instanceof Error
          ? caught.message
          : "That did not save. Please try again.",
      );
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-start gap-3 rounded-panel border border-salt/20 px-5 py-4 text-sm text-salt/80">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-jaggery" aria-hidden="true" />
        <p>You are on the list. We will write when there is something to say.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <label htmlFor="newsletter-email" className="sr-only">
        Email for the newsletter
      </label>
      <div className="flex items-center gap-2 rounded-full border border-salt/25 p-1 pl-5 focus-within:border-salt/60">
        <input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-sm text-salt outline-none placeholder:text-salt/35"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-salt text-ink transition-colors hover:bg-dune disabled:opacity-60"
          aria-label="Subscribe to the letter"
        >
          {status === "sending" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <label className="flex items-start gap-2.5 text-xs text-salt/55">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-salt/30 bg-transparent accent-jaggery"
        />
        <span>
          Send me the occasional letter. No more than once a month, and I can
          unsubscribe at any time.
        </span>
      </label>

      {error ? (
        <p role="alert" className="text-xs text-[#e6a79f]">
          {error}
        </p>
      ) : null}
    </form>
  );
}
