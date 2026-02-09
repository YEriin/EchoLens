"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { PersonaMonologue } from "@/types/mirror";
import { PRESET_PERSONAS } from "@/lib/prompts/persona-definitions";
import { useAppStore } from "@/stores/app-store";
import { calculateRisk } from "@/lib/utils/risk-calculator";
import { cn } from "@/lib/utils";

const REACTION_MAP: Record<string, { label: string; color: string }> = {
  positive: { label: "正面", color: "text-green-600" },
  neutral: { label: "中性", color: "text-muted-foreground" },
  confused: { label: "困惑", color: "text-amber-600" },
  negative: { label: "负面", color: "text-red-500" },
  hostile: { label: "敌意", color: "text-red-700" },
};

interface MonologueCardProps {
  monologue: PersonaMonologue;
}

export function MonologueCard({ monologue }: MonologueCardProps) {
  const savedPersonas = useAppStore((s) => s.savedPersonas);
  const preset = PRESET_PERSONAS.find((p) => p.id === monologue.personaId);
  const saved = savedPersonas.find((p) => p.id === monologue.personaId);

  const emoji = preset?.emoji ?? saved?.emoji ?? "👤";
  const name = preset?.name ?? saved?.name ?? monologue.personaId;

  const reaction = REACTION_MAP[monologue.overallReaction] ?? REACTION_MAP.neutral;
  const risk = calculateRisk(monologue.annotations);

  return (
    <Card className="border border-border/60">
      <CardContent className="pt-4 pb-4 px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <span className="font-medium text-sm">{name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium", reaction.color)}>
              {reaction.label}
            </span>
            {risk.redCount > 0 && (
              <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-sm">
                {risk.label}
              </span>
            )}
            {risk.redCount === 0 && risk.yellowCount > 0 && (
              <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-sm">
                {risk.label}
              </span>
            )}
          </div>
        </div>
        <div className="bg-muted/50 rounded-sm p-3">
          <p className="text-sm leading-relaxed text-foreground/90 italic">
            &ldquo;{monologue.monologue}&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
