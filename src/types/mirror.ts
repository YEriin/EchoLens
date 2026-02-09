export type RiskLevel = "red" | "yellow" | "green";
export type OverallReaction = "positive" | "neutral" | "confused" | "negative" | "hostile";

export interface RiskAnnotation {
  sentence: string;
  sentenceIndex: number;
  risk: RiskLevel;
  reason: string;
  rewrite: string;
}

export interface PersonaMonologue {
  personaId: string;
  monologue: string;
  overallReaction: OverallReaction;
  annotations: RiskAnnotation[];
}

export interface MirrorResult {
  personas: PersonaMonologue[];
}
