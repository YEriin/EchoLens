import type { TuneConfig } from "@/types/tune";

export interface PersonaCard {
  id: string;
  name: string;
  emoji: string;
  styleLabels: string[];
  preferencePatterns: string[];
  triggerPoints: string[];
  communicationWindow: string;
  summary: string;
  promptFragment: string;
  tuneConfig: TuneConfig;
  createdAt: number;
}

export interface PresetPersona {
  id: string;
  name: string;
  emoji: string;
  coreTrait: string;
  promptFragment: string;
  tuneConfig: TuneConfig;
}
