import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, error, json } from "@/lib/api";
import { createSavedResultSchema } from "@/lib/validation";

export const runtime = "nodejs";

// GET /api/results — all saved quote versions for the current user
export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  const results = await prisma.savedResult.findMany({
    where: { userId: auth.sub },
    orderBy: { createdAt: "desc" },
    include: { simulation: { select: { id: true, title: true, projectType: true } } },
  });

  return json({ results });
}

// POST /api/results — save a new quote version for one of the user's simulations
export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }

  const parsed = createSavedResultSchema.safeParse(body);
  if (!parsed.success) {
    return error("Validation failed", 422, { issues: parsed.error.flatten() });
  }
  const data = parsed.data;

  // The simulation must belong to the current user.
  const simulation = await prisma.simulation.findFirst({
    where: { id: data.simulationId, userId: auth.sub },
    select: { id: true },
  });
  if (!simulation) return error("Simulation not found", 404);

  // Auto-increment the version number for this simulation.
  const last = await prisma.savedResult.findFirst({
    where: { simulationId: data.simulationId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const version = (last?.version ?? 0) + 1;

  const result = await prisma.savedResult.create({
    data: {
      userId: auth.sub,
      simulationId: data.simulationId,
      version,
      label: data.label,
      amount: data.amount,
      breakdown: (data.breakdown ?? undefined) as never,
      notes: data.notes,
      status: data.status ?? "DRAFT",
    },
  });

  return json({ result }, 201);
}
