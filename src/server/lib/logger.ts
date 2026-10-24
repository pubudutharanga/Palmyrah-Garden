import "server-only";

type LogContext = Record<string, unknown>;

function redact(context: LogContext): LogContext {
  const blocked = new Set(["email", "phone", "idNumber", "authorization", "token"]);
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      blocked.has(key) ? "[redacted]" : value,
    ]),
  );
}

/**
 * One structured log line per event. Never pass guest contact details in.
 */
export const logger = {
  info(event: string, context: LogContext = {}) {
    console.info(JSON.stringify({ level: "info", event, ...redact(context) }));
  },
  warn(event: string, context: LogContext = {}) {
    console.warn(JSON.stringify({ level: "warn", event, ...redact(context) }));
  },
  error(event: string, context: LogContext = {}) {
    console.error(JSON.stringify({ level: "error", event, ...redact(context) }));
  },
};
