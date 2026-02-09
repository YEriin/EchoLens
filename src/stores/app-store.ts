import { create } from "zustand";
import type { MirrorResult } from "@/types/mirror";
import type { TuneConfig, TuneResult } from "@/types/tune";
import type { PersonaCard } from "@/types/persona";
import type { AnalyzeLayer } from "@/types/api";
import { loadPersonas, savePersonas } from "@/lib/utils/persona-storage";
import { PRESET_PERSONAS } from "@/lib/prompts/persona-definitions";

const DEFAULT_TUNE: TuneConfig = { formality: 50, power: 50, emotion: 50, cognition: 50 };

function resolveTuneConfig(personaId: string, savedPersonas: PersonaCard[]): TuneConfig {
  const preset = PRESET_PERSONAS.find((p) => p.id === personaId);
  if (preset) return preset.tuneConfig;
  const saved = savedPersonas.find((p) => p.id === personaId);
  if (saved) return saved.tuneConfig;
  return DEFAULT_TUNE;
}

interface AppState {
  // Input
  message: string;
  conversationHistory: string;
  selectedPersona: string | null;
  tuneConfig: TuneConfig;

  // Results
  mirrorResult: MirrorResult | null;
  tuneResult: TuneResult | null;
  correctedMessage: string | null;

  // Personas
  savedPersonas: PersonaCard[];

  // Rewrites accepted by user: map of sentenceIndex -> rewrite text
  acceptedRewrites: Map<number, string>;

  // UI state
  isAnalyzing: boolean;
  isGeneratingPersona: boolean;
  activeResultTab: "monologue" | "register";
  personaLabOpen: boolean;
  error: string | null;

  // Actions
  setMessage: (msg: string) => void;
  setConversationHistory: (text: string) => void;
  selectPersona: (id: string | null) => void;
  setTuneConfig: (config: Partial<TuneConfig>) => void;
  setActiveResultTab: (tab: "monologue" | "register") => void;
  setPersonaLabOpen: (open: boolean) => void;

  analyze: () => Promise<void>;
  generatePersona: (chatHistory: string, name?: string) => Promise<void>;
  savePersona: (card: PersonaCard) => void;
  deletePersona: (id: string) => void;
  initPersonas: () => void;

  acceptRewrite: (sentenceIndex: number, rewrite: string) => void;
  clearResults: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Defaults
  message: "",
  conversationHistory: "",
  selectedPersona: "impatient-boss",
  tuneConfig: PRESET_PERSONAS.find((p) => p.id === "impatient-boss")!.tuneConfig,
  mirrorResult: null,
  tuneResult: null,
  correctedMessage: null,
  savedPersonas: [],
  acceptedRewrites: new Map(),
  isAnalyzing: false,
  isGeneratingPersona: false,
  activeResultTab: "monologue",
  personaLabOpen: false,
  error: null,

  setMessage: (msg) => set({ message: msg }),
  setConversationHistory: (text) => set({ conversationHistory: text }),

  selectPersona: (id) => {
    if (!id) {
      set({ selectedPersona: null });
      return;
    }
    const tuneConfig = resolveTuneConfig(id, get().savedPersonas);
    set({ selectedPersona: id, tuneConfig });
  },

  setTuneConfig: (config) =>
    set((state) => ({ tuneConfig: { ...state.tuneConfig, ...config } })),

  setActiveResultTab: (tab) => set({ activeResultTab: tab }),
  setPersonaLabOpen: (open) => set({ personaLabOpen: open }),

  analyze: async () => {
    const { message, conversationHistory, selectedPersona, tuneConfig, savedPersonas } = get();
    if (!message.trim() || !selectedPersona) return;

    set({ isAnalyzing: true, error: null, mirrorResult: null, tuneResult: null, correctedMessage: null, acceptedRewrites: new Map() });

    try {
      const layer: AnalyzeLayer = "both";

      const customPersonas = savedPersonas
        .filter((p) => p.id === selectedPersona)
        .map((p) => ({ id: p.id, name: p.name, promptFragment: p.promptFragment }));

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversationHistory: conversationHistory.trim() || undefined,
          layer,
          personas: [selectedPersona],
          tuneConfig,
          customPersonas,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `请求失败 (${res.status})`);
      }

      const data = await res.json();
      set({
        mirrorResult: data.mirror ?? null,
        tuneResult: data.tune ?? null,
        correctedMessage: data.correctedMessage ?? null,
        isAnalyzing: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "分析失败",
        isAnalyzing: false,
      });
    }
  },

  generatePersona: async (chatHistory, name) => {
    set({ isGeneratingPersona: true, error: null });

    try {
      const res = await fetch("/api/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatHistory, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `请求失败 (${res.status})`);
      }

      const data = await res.json();
      const card: PersonaCard = {
        ...data,
        id: `custom-${Date.now()}`,
        tuneConfig: DEFAULT_TUNE,
        createdAt: Date.now(),
      };

      set((state) => {
        const updated = [...state.savedPersonas, card];
        savePersonas(updated);
        return { savedPersonas: updated, isGeneratingPersona: false };
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "人格生成失败",
        isGeneratingPersona: false,
      });
    }
  },

  savePersona: (card) =>
    set((state) => {
      const updated = [...state.savedPersonas, card];
      savePersonas(updated);
      return { savedPersonas: updated };
    }),

  deletePersona: (id) =>
    set((state) => {
      const updated = state.savedPersonas.filter((p) => p.id !== id);
      savePersonas(updated);
      return {
        savedPersonas: updated,
        selectedPersona: state.selectedPersona === id ? null : state.selectedPersona,
      };
    }),

  initPersonas: () => {
    const saved = loadPersonas();
    set({ savedPersonas: saved });
  },

  acceptRewrite: (sentenceIndex, rewrite) =>
    set((state) => {
      const updated = new Map(state.acceptedRewrites);
      updated.set(sentenceIndex, rewrite);
      return { acceptedRewrites: updated };
    }),

  clearResults: () =>
    set({ mirrorResult: null, tuneResult: null, correctedMessage: null, error: null, acceptedRewrites: new Map() }),
}));
