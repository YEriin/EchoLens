"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PersonaCard as PersonaCardType } from "@/types/persona";
import { useAppStore } from "@/stores/app-store";

interface PersonaCardProps {
  persona: PersonaCardType;
}

export function PersonaCard({ persona }: PersonaCardProps) {
  const deletePersona = useAppStore((s) => s.deletePersona);

  return (
    <Card className="border border-border/60 rotate-[-0.3deg]">
      <CardContent className="pt-4 pb-4 px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{persona.emoji}</span>
            <span className="font-medium text-sm">{persona.name}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground hover:text-red-500"
            onClick={() => deletePersona(persona.id)}
          >
            删除
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">{persona.summary}</p>

        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground">沟通风格</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {persona.styleLabels.map((label) => (
                <Badge key={label} variant="secondary" className="text-[11px]">
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs text-muted-foreground">偏好</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {persona.preferencePatterns.map((pref) => (
                <Badge key={pref} variant="outline" className="text-[11px]">
                  {pref}
                </Badge>
              ))}
            </div>
          </div>

          {persona.triggerPoints.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">雷区</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {persona.triggerPoints.map((trigger) => (
                  <Badge key={trigger} variant="outline" className="text-[11px] border-red-200 text-red-600 bg-red-50">
                    {trigger}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {persona.communicationWindow && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">最佳沟通时机：</span>{persona.communicationWindow}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
