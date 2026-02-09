import { z } from "zod/v4";

export const personaGenerateRequestSchema = z.object({
  chatHistory: z.string().min(10).max(10000),
  name: z.string().max(20).optional(),
});

export const personaGenerateResultSchema = z.object({
  name: z.string(),
  emoji: z.string(),
  styleLabels: z.array(z.string()),
  preferencePatterns: z.array(z.string()),
  triggerPoints: z.array(z.string()),
  communicationWindow: z.string(),
  summary: z.string(),
  promptFragment: z.string(),
});
