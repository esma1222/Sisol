import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(120).optional(),
  phone: z.string().max(40).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const projectTypeSchema = z.enum([
  "LOFT_CONVERSION",
  "EXTENSION",
  "REFURBISHMENT",
  "ROOFING",
  "GROUNDWORKS",
  "OTHER",
]);

export const finishLevelSchema = z.enum(["BASIC", "STANDARD", "PREMIUM"]);

export const simulationStatusSchema = z.enum([
  "DRAFT",
  "SUBMITTED",
  "QUOTED",
  "ACCEPTED",
  "DECLINED",
]);

export const createSimulationSchema = z.object({
  title: z.string().min(1).max(160),
  projectType: projectTypeSchema,
  description: z.string().max(5000).optional(),
  contactName: z.string().min(1).max(160),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(40).optional(),
  addressLine: z.string().max(240).optional(),
  city: z.string().max(120).optional(),
  postcode: z.string().max(20).optional(),
  areaSqm: z.number().positive().max(100000).optional(),
  finishLevel: finishLevelSchema.optional(),
  inputs: z.record(z.unknown()).optional(),
});

export const updateSimulationSchema = createSimulationSchema.partial().extend({
  status: simulationStatusSchema.optional(),
});

export const savedResultStatusSchema = z.enum(["DRAFT", "FINAL", "SENT"]);

export const createSavedResultSchema = z.object({
  simulationId: z.string().min(1),
  label: z.string().max(160).optional(),
  amount: z.number().nonnegative().optional(),
  breakdown: z.record(z.unknown()).optional(),
  notes: z.string().max(5000).optional(),
  status: savedResultStatusSchema.optional(),
});

export const updateSavedResultSchema = z.object({
  label: z.string().max(160).optional(),
  amount: z.number().nonnegative().optional(),
  breakdown: z.record(z.unknown()).optional(),
  notes: z.string().max(5000).optional(),
  status: savedResultStatusSchema.optional(),
});
