import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { error, json } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return error("Validation failed", 422, { issues: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Same response whether the user exists or the password is wrong.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return error("Invalid email or password", 401);
  }

  const token = await createSessionToken({ sub: user.id, email: user.email, role: user.role });
  await setSessionCookie(token);

  return json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
