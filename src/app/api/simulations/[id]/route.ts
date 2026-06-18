import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, error, json } from "@/lib/api";
import { updateSimulationSchema } from "@/lib/validation";
import { estimateProjectCost } from "@/lib/simulator";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

async function ownedSimulation(userId: string, id: string) {
  return prisma.simulation.findFirst({ where: { id, userId } });
}

// GET /api/simulations/:id — a simulation with its saved quote versions
export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const simulation = await prisma.simulation.findFirst({
    where: { id, userId: auth.sub },
    include: { savedResults: { orderBy: { version: "desc" } } },
  });
  if (!simulation) return error("Simulation not found", 404);

  return json({ simulation });
}

// PATCH /api/simulations/:id — update fields; recompute estimate if inputs change
export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const existing = await ownedSimulation(auth.sub, id);
  if (!existing) return error("Simulation not found", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }

  const parsed = updateSimulationSchema.safeParse(body);
  if (!parsed.success) {
    return error("Validation failed", 422, { issues: parsed.error.flatten() });
  }
  const data = parsed.data;

  // Recompute the ballpark when any estimator input changed.
  const inputsChanged =
    data.projectType !== undefined ||
    data.areaSqm !== undefined ||
    data.finishLevel !== undefined;

  const estimate = inputsChanged
    ? estimateProjectCost({
        projectType: data.projectType ?? existing.projectType,
        areaSqm: data.areaSqm ?? existing.areaSqm,
        finishLevel: data.finishLevel ?? existing.finishLevel,
      })
    : null;

  const simulation = await prisma.simulation.update({
    where: { id },
    data: {
      ...data,
      inputs: (data.inputs ?? undefined) as never,
      ...(estimate ? { estimateMin: estimate.min, estimateMax: estimate.max } : {}),
    },
  });

  return json({ simulation, estimate });
}

// DELETE /api/simulations/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const existing = await ownedSimulation(auth.sub, id);
  if (!existing) return error("Simulation not found", 404);

  await prisma.simulation.delete({ where: { id } });
  return json({ ok: true });
}
