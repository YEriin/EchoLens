import type { MirrorResult } from "./mirror";
import type { TuneConfig, TuneResult } from "./tune";

export type AnalyzeLayer = "mirror" | "tune" | "both";

export interface AnalyzeRequest {
  message: string;
  conversationHistory?: string;
  layer: AnalyzeLayer;
  personas: string[];
  tuneConfig?: TuneConfig;
}

export interface AnalyzeResponse {
  mirror?: MirrorResult;
  tune?: TuneResult;
  correctedMessage?: string;
}

export interface PersonaGenerateRequest {
  chatHistory: string;
  name?: string;
}

export interface PersonaGenerateResponse {
  name: string;
  emoji: string;
  styleLabels: string[];
  preferencePatterns: string[];
  triggerPoints: string[];
  communicationWindow: string;
  summary: string;
  promptFragment: string;
}
