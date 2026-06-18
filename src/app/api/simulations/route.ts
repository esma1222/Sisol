import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, error, json } from "@/lib/api";
import { createSimulationSchema } from "@/lib/validation";
import { estimateProjectCost } from "@/lib/simulator";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/simulations — list the current user's simulations
export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  const simulations = await prisma.simulation.findMany({
    where: { userId: auth.sub },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { savedResults: true } } },
  });

  return json({ simulations });
}

// POST /api/simulations — create a quote/lead and compute a ballpark estimate
export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }

  const parsed = createSimulationSchema.safeParse(body);
  if (!parsed.success) {
    return error("Validation failed", 422, { issues: parsed.error.flatten() });
  }

  const data = parsed.data;
  const estimate = estimateProjectCost({
    projectType: data.projectType,
    areaSqm: data.areaSqm,
    finishLevel: data.finishLevel,
  });

  const simulation = await prisma.simulation.create({
    data: {
      userId: auth.sub,
      title: data.title,
      projectType: data.projectType,
      description: data.description,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      addressLine: data.addressLine,
      city: data.city,
      postcode: data.postcode,
      areaSqm: data.areaSqm,
      finishLevel: data.finishLevel ?? "STANDARD",
      inputs: (data.inputs ?? undefined) as never,
      estimateMin: estimate.min,
      estimateMax: estimate.max,
      currency: estimate.currency,
      status: "SUBMITTED",
    },
  });

  return json({ simulation, estimate }, 201);
}
