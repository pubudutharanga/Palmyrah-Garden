"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyFrontDeskCredentials, type FrontDeskLoginState } from "@/lib/front-desk";
import { FRONT_DESK_COOKIE, FRONT_DESK_SESSION_VALUE } from "@/lib/front-desk-session";

/** A front desk shift: eight hours. */
const SESSION_SECONDS = 60 * 60 * 8;

export async function signInToFrontDesk(
  _previousState: FrontDeskLoginState,
  formData: FormData,
): Promise<FrontDeskLoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Enter your username and password.", username };
  }

  if (!verifyFrontDeskCredentials(username, password)) {
    return { error: "That username or password is incorrect.", username };
  }

  const cookieStore = await cookies();
  cookieStore.set(FRONT_DESK_COOKIE, FRONT_DESK_SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });

  redirect("/admin/room-board");
}

export async function signOutOfFrontDesk(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(FRONT_DESK_COOKIE);
  redirect("/admin/login");
}
