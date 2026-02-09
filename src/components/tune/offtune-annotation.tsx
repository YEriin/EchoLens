"use client";

import type { OfftuneWord } from "@/types/tune";
import { Badge } from "@/components/ui/badge";

const DIMENSION_LABELS: Record<string, string> = {
  formality: "正式度",
  power: "权力关系",
  emotion: "情感温度",
  cognition: "认知水平",
};

const DIMENSION_COLORS: Record<string, string> = {
  formality: "bg-blue-50 text-blue-700 border-blue-200",
  power: "bg-purple-50 text-purple-700 border-purple-200",
  emotion: "bg-rose-50 text-rose-700 border-rose-200",
  cognition: "bg-teal-50 text-teal-700 border-teal-200",
};

interface OfftuneAnnotationProps {
  words: OfftuneWord[];
}

export function OfftuneAnnotation({ words }: OfftuneAnnotationProps) {
  if (words.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">跑调词标注</h4>
      <div className="space-y-2">
        {words.map((word, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-sm border border-border/60 bg-card hand-card"
          >
            <Badge
              variant="outline"
              className={`shrink-0 text-[11px] ${DIMENSION_COLORS[word.dimension]}`}
            >
              {DIMENSION_LABELS[word.dimension]}
            </Badge>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm">
                <span className="font-medium">&ldquo;{word.word}&rdquo;</span>
                <span className="text-muted-foreground ml-1">→ {word.issue}</span>
              </p>
              <p className="text-xs text-green-700">{word.suggestion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
