// Ballpark construction cost estimator for SISOL quotes.
// These are indicative London rates (£ per m²) used to seed a quote — the real
// figure is confirmed after a site visit. Tune freely; this is intentionally simple.

export type ProjectType =
  | "LOFT_CONVERSION"
  | "EXTENSION"
  | "REFURBISHMENT"
  | "ROOFING"
  | "GROUNDWORKS"
  | "OTHER";

export type FinishLevel = "BASIC" | "STANDARD" | "PREMIUM";

// Indicative London cost band per m² (min, max) before finish adjustment.
const RATE_PER_SQM: Record<ProjectType, [number, number]> = {
  LOFT_CONVERSION: [1500, 2400],
  EXTENSION: [2000, 3000],
  REFURBISHMENT: [1200, 2200],
  ROOFING: [200, 450],
  GROUNDWORKS: [300, 700],
  OTHER: [1000, 2000],
};

const FINISH_MULTIPLIER: Record<FinishLevel, number> = {
  BASIC: 0.85,
  STANDARD: 1,
  PREMIUM: 1.35,
};

// A nominal fixed allowance when no area is supplied, so a quote still gets a band.
const FALLBACK_AREA_SQM: Record<ProjectType, number> = {
  LOFT_CONVERSION: 30,
  EXTENSION: 25,
  REFURBISHMENT: 60,
  ROOFING: 80,
  GROUNDWORKS: 40,
  OTHER: 30,
};

export type EstimateInput = {
  projectType: ProjectType;
  areaSqm?: number | null;
  finishLevel?: FinishLevel | null;
};

export type EstimateBreakdownLine = {
  label: string;
  amount: number;
};

export type Estimate = {
  min: number;
  max: number;
  currency: "GBP";
  assumptions: {
    areaSqm: number;
    finishLevel: FinishLevel;
    ratePerSqm: [number, number];
  };
  breakdown: EstimateBreakdownLine[];
};

function round(value: number): number {
  // Round to the nearest £100 for a tidy ballpark.
  return Math.round(value / 100) * 100;
}

export function estimateProjectCost(input: EstimateInput): Estimate {
  const projectType = input.projectType in RATE_PER_SQM ? input.projectType : "OTHER";
  const finishLevel: FinishLevel = input.finishLevel ?? "STANDARD";
  const area =
    input.areaSqm && input.areaSqm > 0 ? input.areaSqm : FALLBACK_AREA_SQM[projectType];

  const [rateMin, rateMax] = RATE_PER_SQM[projectType];
  const multiplier = FINISH_MULTIPLIER[finishLevel] ?? 1;

  const baseMin = rateMin * area * multiplier;
  const baseMax = rateMax * area * multiplier;

  // Preliminaries / contingency add-ons applied to the midpoint.
  const prelimsRate = 0.1; // site setup, welfare, management
  const contingencyRate = 0.07;

  const min = round(baseMin * (1 + prelimsRate));
  const max = round(baseMax * (1 + prelimsRate + contingencyRate));

  const breakdown: EstimateBreakdownLine[] = [
    { label: "Construction works (min)", amount: round(baseMin) },
    { label: "Construction works (max)", amount: round(baseMax) },
    { label: `Preliminaries (${Math.round(prelimsRate * 100)}%)`, amount: round(baseMax * prelimsRate) },
    { label: `Contingency (${Math.round(contingencyRate * 100)}%)`, amount: round(baseMax * contingencyRate) },
  ];

  return {
    min,
    max,
    currency: "GBP",
    assumptions: { areaSqm: area, finishLevel, ratePerSqm: [rateMin, rateMax] },
    breakdown,
  };
}
