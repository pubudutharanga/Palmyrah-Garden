import type { ApiFailure, ApiSuccess } from "@/lib/types";

export class ApiClientError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code = "INTERNAL", details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      cache: "no-store",
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiClientError(
      "We could not reach the server. Check your connection and try again.",
      "NETWORK",
    );
  }

  let body: ApiSuccess<T> | ApiFailure | null = null;
  try {
    body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  } catch {
    body = null;
  }

  if (!body) {
    throw new ApiClientError(
      "The server returned an unexpected response. Please try again.",
      "BAD_RESPONSE",
    );
  }

  if (!body.ok) {
    throw new ApiClientError(
      body.error.message || "Something went wrong. Please try again.",
      body.error.code,
      body.error.details,
    );
  }

  return body.data;
}
