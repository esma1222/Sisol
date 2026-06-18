// Edge-safe session helpers (JWT only — no Node-specific deps).
// Safe to import from middleware (Edge runtime) as well as Node route handlers.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "sisol_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Generate one with: openssl rand -base64 32");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string; // user id
  email: string;
  role: string;
};

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      role: String(payload.role ?? "CLIENT"),
    };
  } catch {
    return null;
  }
}
