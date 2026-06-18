import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { error, json } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return error("Validation failed", 422, { issues: parsed.error.flatten() });
  }

  const { email, password, name, phone } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), name, phone, passwordHash },
      select: { id: true, email: true, name: true, role: true },
    });

    const token = await createSessionToken({ sub: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);

    return json({ user }, 201);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return error("An account with that email already exists", 409);
    }
    console.error("register error", err);
    return error("Could not create account", 500);
  }
}
