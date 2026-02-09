import { z } from "zod/v4";

export const tuneConfigSchema = z.object({
  formality: z.number().min(0).max(100),
  power: z.number().min(0).max(100),
  emotion: z.number().min(0).max(100),
  cognition: z.number().min(0).max(100),
});

export const dimensionScoreSchema = z.object({
  score: z.number(),
  expected: z.number(),
  gap: z.string(),
});

export const offtuneWordSchema = z.object({
  word: z.string(),
  position: z.number(),
  issue: z.string(),
  suggestion: z.string(),
  replacement: z.string(),
  dimension: z.enum(["formality", "power", "emotion", "cognition"]),
});

export const tuneResultSchema = z.object({
  registerScore: z.number().min(0).max(100),
  dimensions: z.object({
    formality: dimensionScoreSchema,
    power: dimensionScoreSchema,
    emotion: dimensionScoreSchema,
    cognition: dimensionScoreSchema,
  }),
  offtuneWords: z.array(offtuneWordSchema),
});

export const tuneRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  tuneConfig: tuneConfigSchema,
});
