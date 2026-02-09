"use client";

import type { TuneResult } from "@/types/tune";
import { cn } from "@/lib/utils";

interface RegisterScoreProps {
  result: TuneResult;
}

const DIMENSION_LABELS: Record<string, string> = {
  formality: "正式度",
  power: "权力关系",
  emotion: "情感温度",
  cognition: "认知水平",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-500";
}

function getScoreLabel(score: number, expected: number): { icon: string; text: string } {
  const diff = Math.abs(score - expected);
  if (diff <= 15) return { icon: "✓", text: "合适" };
  if (score < expected) return { icon: "↓", text: "偏低" };
  return { icon: "↑", text: "偏高" };
}

export function RegisterScore({ result }: RegisterScoreProps) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (result.registerScore / 100) * circumference;

  return (
    <div className="space-y-5">
      {/* Score gauge */}
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
              style={{ filter: 'url(#sketchy)' }}
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={getScoreColor(result.registerScore)}
              style={{ filter: 'url(#sketchy)' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-xl font-bold", getScoreColor(result.registerScore))}>
              {result.registerScore}
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">语域匹配度</p>
          <p className="text-xs text-muted-foreground mt-1">
            {result.registerScore >= 80
              ? "表达方式与场景高度匹配"
              : result.registerScore >= 60
                ? "基本匹配，部分表达可优化"
                : "表达方式与场景有明显偏差"}
          </p>
        </div>
      </div>

      {/* Dimension breakdown */}
      <div className="space-y-3">
        {Object.entries(result.dimensions).map(([key, dim]) => {
          const label = getScoreLabel(dim.score, dim.expected);
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{DIMENSION_LABELS[key]}</span>
                <span className="flex items-center gap-1 text-xs">
                  <span className={cn(
                    label.icon === "✓" ? "text-green-600" : "text-amber-600"
                  )}>
                    {label.icon} {label.text}
                  </span>
                  <span className="text-muted-foreground">
                    (期望 {dim.expected}, 实际 {dim.score})
                  </span>
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-sm overflow-hidden" style={{ filter: 'url(#sketchy)' }}>
                <div
                  className={cn(
                    "h-full rounded-sm transition-all",
                    Math.abs(dim.score - dim.expected) <= 15
                      ? "bg-green-500"
                      : "bg-amber-500"
                  )}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{dim.gap}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
