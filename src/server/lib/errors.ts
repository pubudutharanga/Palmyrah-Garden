import "server-only";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "ROOM_UNAVAILABLE"
  | "INVALID_STATE"
  | "CONFLICT"
  | "HOLD_EXPIRED"
  | "PAYMENT_FAILED"
  | "RATE_LIMITED"
  | "NOT_CONFIGURED"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, status: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const errors = {
  validation: (message = "Check the details and try again.", details?: unknown) =>
    new AppError("VALIDATION_ERROR", 400, message, details),
  unauthorized: (message = "That link is not valid. Ask reception for help.") =>
    new AppError("UNAUTHORIZED", 401, message),
  forbidden: (message = "You do not have access to that.") =>
    new AppError("FORBIDDEN", 403, message),
  notFound: (message = "We could not find that.") =>
    new AppError("NOT_FOUND", 404, message),
  roomUnavailable: (message: string, details?: unknown) =>
    new AppError("ROOM_UNAVAILABLE", 409, message, details),
  invalidState: (message: string) => new AppError("INVALID_STATE", 409, message),
  conflict: (message = "That request conflicts with another. Try again.") =>
    new AppError("CONFLICT", 409, message),
  rateLimited: (message = "Too many requests. Please wait a moment and try again.") =>
    new AppError("RATE_LIMITED", 429, message),
  notConfigured: (message = "This service is not configured yet.") =>
    new AppError("NOT_CONFIGURED", 503, message),
  internal: (message = "Something went wrong on our side. Please try again.") =>
    new AppError("INTERNAL", 500, message),
};

export class RoomUnavailableError extends AppError {
  constructor(details?: unknown) {
    super(
      "ROOM_UNAVAILABLE",
      409,
      "One of those rooms has just been taken. Choose another room or different dates.",
      details,
    );
    this.name = "RoomUnavailableError";
  }
}
