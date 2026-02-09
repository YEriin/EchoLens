"use client";

import { Plus, X } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { PRESET_PERSONAS } from "@/lib/prompts/persona-definitions";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ROTATIONS = [
  "rotate-[-0.8deg]",
  "rotate-[0.5deg]",
  "rotate-[-0.3deg]",
  "rotate-[0.7deg]",
  "rotate-[-0.5deg]",
  "rotate-[0.4deg]",
  "rotate-[-0.6deg]",
  "rotate-[0.3deg]",
];

export function PersonaSelector() {
  const selectedPersona = useAppStore((s) => s.selectedPersona);
  const selectPersona = useAppStore((s) => s.selectPersona);
  const savedPersonas = useAppStore((s) => s.savedPersonas);
  const isAnalyzing = useAppStore((s) => s.isAnalyzing);
  const setPersonaLabOpen = useAppStore((s) => s.setPersonaLabOpen);
  const deletePersona = useAppStore((s) => s.deletePersona);

  const allPersonas = [
    ...PRESET_PERSONAS.map((p) => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      coreTrait: p.coreTrait,
      isCustom: false,
    })),
    ...savedPersonas.map((p) => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      coreTrait: p.styleLabels?.[0] ?? "",
      isCustom: true,
    })),
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        你在跟谁说话？
      </label>
      <TooltipProvider delayDuration={300}>
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
          {allPersonas.map((persona, i) => {
            const isSelected = selectedPersona === persona.id;
            return (
              <Tooltip key={persona.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => selectPersona(persona.id)}
                    disabled={isAnalyzing}
                    className={cn(
                      "group/card relative flex-none snap-start flex flex-col items-center gap-1 px-3 py-2.5 rounded-sm text-center transition-all border w-[96px]",
                      ROTATIONS[i % ROTATIONS.length],
                      isSelected
                        ? "bg-amber-50/40 border-2 border-amber-700/50 hand-shadow"
                        : "bg-card border-border/60 hover:border-amber-400/50 hover:bg-amber-50/20",
                      isAnalyzing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {persona.isCustom && !isAnalyzing && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePersona(persona.id);
                        }}
                        className="absolute -top-1.5 -right-1.5 z-10 hidden group-hover/card:flex items-center justify-center w-5 h-5 rounded-full bg-background border border-border/80 text-muted-foreground hover:text-red-500 hover:border-red-300 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                    <span className="text-[32px] leading-none">{persona.emoji}</span>
                    <span className={cn(
                      "text-[13px] font-medium leading-tight",
                      isSelected ? "text-amber-800" : "text-foreground"
                    )}>
                      {persona.name}
                    </span>
                    <span className={cn(
                      "text-[11px] leading-tight line-clamp-1",
                      isSelected ? "text-amber-600" : "text-muted-foreground"
                    )}>
                      {persona.coreTrait}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="text-xs font-medium">{persona.name}</p>
                  <p className="text-xs">{persona.coreTrait}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          <button
            onClick={() => setPersonaLabOpen(true)}
            disabled={isAnalyzing}
            className={cn(
              "flex-none snap-start flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-sm border border-dashed border-border/60 w-[96px] text-muted-foreground hover:border-primary/50 hover:text-primary transition-all",
              isAnalyzing && "opacity-50 cursor-not-allowed"
            )}
          >
            <Plus className="w-6 h-6" />
            <span className="text-[11px]">生成人格</span>
          </button>
        </div>
      </TooltipProvider>
    </div>
  );
}
