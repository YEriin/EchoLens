import type { PersonaCard } from "@/types/persona";

const STORAGE_KEY = "echolens-personas";

export function loadPersonas(): PersonaCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PersonaCard[];
  } catch {
    return [];
  }
}

export function savePersonas(personas: PersonaCard[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
}

export function addPersona(card: PersonaCard): PersonaCard[] {
  const existing = loadPersonas();
  const updated = [...existing, card];
  savePersonas(updated);
  return updated;
}

export function removePersona(id: string): PersonaCard[] {
  const existing = loadPersonas();
  const updated = existing.filter((p) => p.id !== id);
  savePersonas(updated);
  return updated;
}
