import "server-only";

import { cookies } from "next/headers";

export const FRONT_DESK_COOKIE = "palmyrah_front_desk";
export const FRONT_DESK_SESSION_VALUE = "demo";

/** Prototype-only session check; a real deployment needs proper auth. */
export async function isFrontDeskAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(FRONT_DESK_COOKIE)?.value === FRONT_DESK_SESSION_VALUE;
}
