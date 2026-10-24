"use client";

import { PROTOTYPE_STORE_KEY, PROTOTYPE_STORE_VERSION } from "@/lib/prototype/settings";
import { createSeedState } from "@/lib/prototype/seed";
import { expirePending, type EngineResult } from "@/lib/prototype/engine";
import type { PrototypeState } from "@/lib/prototype/types";

type Listener = () => void;

let memoryState: PrototypeState | null = null;
let hasLoaded = false;
let storageBound = false;
const listeners = new Set<Listener>();

function storageAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function isPrototypeState(value: unknown): value is PrototypeState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PrototypeState>;
  return (
    candidate.version === PROTOTYPE_STORE_VERSION &&
    Array.isArray(candidate.bookings) &&
    Array.isArray(candidate.blocks) &&
    Array.isArray(candidate.audit) &&
    Array.isArray(candidate.outbox) &&
    Boolean(candidate.housekeeping) &&
    Boolean(candidate.counters)
  );
}

function readStoredState(): PrototypeState | null {
  if (!storageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(PROTOTYPE_STORE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isPrototypeState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredState(state: PrototypeState): void {
  if (!storageAvailable()) return;
  try {
    window.localStorage.setItem(PROTOTYPE_STORE_KEY, JSON.stringify(state));
  } catch {
    // Quota or private-mode failures must not break the in-memory prototype.
    console.warn("[Palmyrah prototype] Could not persist the local booking state.");
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

function bindStorageListener(): void {
  if (storageBound || typeof window === "undefined") return;
  storageBound = true;
  window.addEventListener("storage", (event) => {
    if (event.key !== PROTOTYPE_STORE_KEY) return;
    memoryState = null;
    hasLoaded = false;
    getPrototypeState();
    emit();
  });
}

export function getPrototypeState(): PrototypeState {
  if (hasLoaded && memoryState) return memoryState;

  const stored = readStoredState();
  if (stored) {
    memoryState = stored;
  } else {
    memoryState = createSeedState(new Date());
    writeStoredState(memoryState);
  }
  hasLoaded = true;
  return memoryState;
}

function setMemoryState(state: PrototypeState): void {
  memoryState = state;
  hasLoaded = true;
  writeStoredState(state);
  emit();
}

export function subscribePrototype(listener: Listener): () => void {
  bindStorageListener();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Apply an engine operation to the latest state. The engine re-validates the
 * room and slot before returning a successful next state, so a second request
 * made before a render cannot double-book the room.
 */
export function runPrototypeAction<T>(
  operation: (state: PrototypeState) => EngineResult<T>,
): EngineResult<T> {
  const result = operation(getPrototypeState());
  if (result.ok) setMemoryState(result.state);
  return result;
}

export function applyPrototypeUpdate(
  updater: (state: PrototypeState) => PrototypeState,
): PrototypeState {
  const current = getPrototypeState();
  const next = updater(current);
  if (next !== current) setMemoryState(next);
  return next;
}

export function refreshPendingExpiry(
  nowValue: Date | string = new Date(),
): PrototypeState {
  const current = getPrototypeState();
  const result = expirePending(current, nowValue);
  if (result.changed) setMemoryState(result.state);
  return result.state;
}

export function resetPrototypeState(nowValue: Date | string = new Date()): PrototypeState {
  const seeded = createSeedState(nowValue);
  setMemoryState(seeded);
  return seeded;
}

export function clearPrototypeState(): void {
  if (!storageAvailable()) return;
  try {
    window.localStorage.removeItem(PROTOTYPE_STORE_KEY);
  } catch {
    // Ignore storage errors; the next snapshot will seed in memory.
  }
  memoryState = null;
  hasLoaded = false;
  getPrototypeState();
  emit();
}
