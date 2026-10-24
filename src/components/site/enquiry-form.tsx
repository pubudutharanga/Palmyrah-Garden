"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { contactPage } from "@/content/pages/contact";
import { enquiryTopics } from "@/content/resort";
import { enquirySchema, type EnquiryInput } from "@/lib/validators/enquiry";

export function EnquiryForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      topic: "stay",
      message: "",
      website: "",
    },
  });

  async function submit(values: EnquiryInput) {
    try {
      const response = await fetch("/api/v1/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await response.json()) as
        | { ok: true }
        | { ok: false; error: { message: string; details?: unknown } };

      if (!body.ok) {
        setError("root", { message: body.error.message });
        return;
      }

      setSent(true);
      reset();
      toast.success("Your enquiry has been sent.");
    } catch {
      setError("root", {
        message: "We could not send that. Check your connection and try again.",
      });
    }
  }

  if (sent) {
    return (
      <div className="rounded-panel border border-frond/25 bg-frond/[0.06] p-7 sm:p-9">
        <h3 className="h3">{contactPage.form.successTitle}</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink/65">
          {contactPage.form.successBody}
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-6"
          onClick={() => setSent(false)}
        >
          {contactPage.form.another}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={contactPage.form.fields.name}
          htmlFor="enquiry-name"
          error={errors.name?.message}
        >
          <Input
            id="enquiry-name"
            autoComplete="name"
            placeholder={contactPage.form.placeholders.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "enquiry-name-error" : undefined}
            {...register("name")}
          />
        </Field>
        <Field
          label={contactPage.form.fields.email}
          htmlFor="enquiry-email"
          error={errors.email?.message}
        >
          <Input
            id="enquiry-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={contactPage.form.placeholders.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "enquiry-email-error" : undefined}
            {...register("email")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={contactPage.form.fields.phone}
          htmlFor="enquiry-phone"
          hint="Only if you would like a call."
          error={errors.phone?.message}
        >
          <Input
            id="enquiry-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={contactPage.form.placeholders.phone}
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>
        <Field
          label={contactPage.form.fields.topic}
          htmlFor="enquiry-topic"
          error={errors.topic?.message}
        >
          <Select id="enquiry-topic" {...register("topic")}>
            {enquiryTopics.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label={contactPage.form.fields.message}
        htmlFor="enquiry-message"
        error={errors.message?.message}
      >
        <Textarea
          id="enquiry-message"
          placeholder={contactPage.form.placeholders.message}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "enquiry-message-error" : undefined}
          {...register("message")}
        />
      </Field>

      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="enquiry-website">Leave this field empty</label>
        <input
          id="enquiry-website"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      {errors.root?.message ? (
        <p role="alert" className="text-sm text-danger">
          {errors.root.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {contactPage.form.pending}
            </>
          ) : (
            contactPage.form.submit
          )}
        </Button>
        <p className="max-w-xs text-xs leading-relaxed text-ink/45">
          {contactPage.form.consent}
        </p>
      </div>
    </form>
  );
}
