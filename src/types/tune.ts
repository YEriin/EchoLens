export type TuneDimension = "formality" | "power" | "emotion" | "cognition";

export interface TuneConfig {
  formality: number;
  power: number;
  emotion: number;
  cognition: number;
}

export interface DimensionScore {
  score: number;
  expected: number;
  gap: string;
}

export interface OfftuneWord {
  word: string;
  position: number;
  issue: string;
  suggestion: string;
  replacement: string;
  dimension: TuneDimension;
}

export interface TuneResult {
  registerScore: number;
  dimensions: Record<TuneDimension, DimensionScore>;
  offtuneWords: OfftuneWord[];
}
