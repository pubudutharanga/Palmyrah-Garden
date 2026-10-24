"use client";

import { useActionState } from "react";
import { CircleAlert, LoaderCircle, LogIn } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import type { FrontDeskLoginState } from "@/lib/front-desk";
import { signInToFrontDesk } from "@/server/actions/front-desk";

export function FrontDeskLoginForm() {
  const [state, formAction, pending] = useActionState<FrontDeskLoginState, FormData>(
    signInToFrontDesk,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-input border border-danger/25 bg-danger/[0.06] px-4 py-3 text-sm leading-snug text-danger"
        >
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      ) : null}

      <Field label="Username" htmlFor="front-desk-username">
        <Input
          id="front-desk-username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={state.username ?? ""}
          required
        />
      </Field>

      <Field label="Password" htmlFor="front-desk-password">
        <Input
          id="front-desk-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses({ size: "lg", className: "w-full" })}
      >
        {pending ? (
          <>
            <LoaderCircle
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <LogIn className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
