import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/auth";

export function json(data: unknown, init?: number | ResponseInit) {
  const responseInit = typeof init === "number" ? { status: init } : init;
  return NextResponse.json(data, responseInit);
}

export function error(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/**
 * Resolve the current session or return a 401 response.
 * Usage:
 *   const auth = await requireUser();
 *   if (auth instanceof NextResponse) return auth;
 *   // auth.sub is the user id
 */
export async function requireUser(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) return error("Authentication required", 401);
  return session;
}
