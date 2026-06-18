import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, error, json } from "@/lib/api";
import { updateSavedResultSchema } from "@/lib/validation";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

// GET /api/results/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const result = await prisma.savedResult.findFirst({
    where: { id, userId: auth.sub },
    include: { simulation: { select: { id: true, title: true, projectType: true } } },
  });
  if (!result) return error("Saved result not found", 404);

  return json({ result });
}

// PATCH /api/results/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const existing = await prisma.savedResult.findFirst({ where: { id, userId: auth.sub } });
  if (!existing) return error("Saved result not found", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }

  const parsed = updateSavedResultSchema.safeParse(body);
  if (!parsed.success) {
    return error("Validation failed", 422, { issues: parsed.error.flatten() });
  }
  const data = parsed.data;

  const result = await prisma.savedResult.update({
    where: { id },
    data: { ...data, breakdown: (data.breakdown ?? undefined) as never },
  });

  return json({ result });
}

// DELETE /api/results/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const existing = await prisma.savedResult.findFirst({ where: { id, userId: auth.sub } });
  if (!existing) return error("Saved result not found", 404);

  await prisma.savedResult.delete({ where: { id } });
  return json({ ok: true });
}
