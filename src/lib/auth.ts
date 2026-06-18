// Node-runtime auth helpers: password hashing (bcrypt) and cookie management.
// Edge-safe JWT helpers live in ./session and are re-exported for convenience.
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";

export {
  SESSION_COOKIE,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Set the session cookie (call from a Server Action / Route Handler). */
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Read and verify the current session from cookies. Returns null if absent/invalid. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
