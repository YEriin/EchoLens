import { z } from "zod/v4";

export const riskAnnotationSchema = z.object({
  sentence: z.string(),
  sentenceIndex: z.number(),
  risk: z.enum(["red", "yellow", "green"]),
  reason: z.string(),
  rewrite: z.string(),
});

export const personaMonologueSchema = z.object({
  personaId: z.string(),
  monologue: z.string(),
  overallReaction: z.enum(["positive", "neutral", "confused", "negative", "hostile"]),
  annotations: z.array(riskAnnotationSchema),
});

export const mirrorResultSchema = z.object({
  personas: z.array(personaMonologueSchema),
});

export const mirrorRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  personas: z.array(z.string()).min(1).max(6),
});
