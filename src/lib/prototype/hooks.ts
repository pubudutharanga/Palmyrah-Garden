"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import {
  subscribePrototype,
  getPrototypeState,
  refreshPendingExpiry,
} from "@/lib/prototype/store";
import type { PrototypeState } from "@/lib/prototype/types";

const getServerSnapshot = () => null;

export function usePrototypeState(): PrototypeState | null {
  return useSyncExternalStore(
    subscribePrototype,
    getPrototypeState,
    getServerSnapshot,
  );
}

/**
 * A hydration-safe clock. The first value arrives asynchronously, so server
 * output never depends on the host timezone or a different current minute.
 */
export function usePrototypeClock(intervalMs = 15_000): number {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, intervalMs);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [intervalMs]);

  return now;
}

/**
 * Expire pending holds on load, on focus and on the board's 15-second refresh.
 * Expiry frees the room without a server cron.
 */
export function usePrototypeExpiry(now: number): void {
  useEffect(() => {
    if (!now) return;
    refreshPendingExpiry(new Date(now));
  }, [now]);

  useEffect(() => {
    const onFocus = () => refreshPendingExpiry(new Date());
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);
}
