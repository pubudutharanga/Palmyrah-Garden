/**
 * Demo front-desk credentials.
 *
 * This is a prototype-only gate, not production authentication. Replace it
 * with a real identity provider before connecting live guest data.
 */
export const FRONT_DESK_DEMO_USERNAME = "admin";
export const FRONT_DESK_DEMO_PASSWORD = "2026";

export type FrontDeskLoginState = {
  error?: string;
  username?: string;
};

export function verifyFrontDeskCredentials(username: string, password: string) {
  return (
    username.trim() === FRONT_DESK_DEMO_USERNAME &&
    password === FRONT_DESK_DEMO_PASSWORD
  );
}
