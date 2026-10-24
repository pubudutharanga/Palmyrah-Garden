import "server-only";

import { ZodError, type ZodType } from "zod";

import { AppError, errors } from "@/server/lib/errors";
import { logger } from "@/server/lib/logger";

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

export function getIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "local";
}

function zodDetails(error: ZodError) {
  return {
    fields: error.issues.map((issue) => ({
      field: issue.path.join(".") || "body",
      message: issue.message,
    })),
  };
}

function envelope(status: number, body: ApiEnvelope<unknown>, requestId: string) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "x-request-id": requestId,
    },
  });
}

/** Wraps a route handler with the standard envelope, request id and error map. */
export async function handleApi<T>(
  request: Request,
  handler: (context: { request: Request; requestId: string; ip: string }) => Promise<T>,
): Promise<Response> {
  const requestId = crypto.randomUUID();
  const ip = getIp(request);
  try {
    const data = await handler({ request, requestId, ip });
    return envelope(200, { ok: true, data }, requestId);
  } catch (error) {
    if (error instanceof ZodError) {
      const message =
        error.issues[0]?.message ?? "Check the details you sent.";
      return envelope(
        400,
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message,
            details: zodDetails(error),
          },
        },
        requestId,
      );
    }

    if (error instanceof AppError) {
      return envelope(
        error.status,
        {
          ok: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        },
        requestId,
      );
    }

    logger.error("api.unhandled", {
      requestId,
      path: new URL(request.url).pathname,
      message: error instanceof Error ? error.message : "unknown",
    });
    return envelope(
      500,
      {
        ok: false,
        error: {
          code: "INTERNAL",
          message: "Something went wrong on our side. Please try again.",
        },
      },
      requestId,
    );
  }
}

export async function parseJson<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw errors.validation("Send the booking details as JSON.");
  }
  return schema.parse(body);
}

export function parseQuery<T>(request: Request, schema: ZodType<T>): T {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  return schema.parse(params);
}

export function requireSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host = request.headers.get("host");
  if (!host) throw errors.forbidden("That request came from an unknown origin.");
  if (new URL(origin).host !== host) {
    throw errors.forbidden("That request came from another site.");
  }
}
