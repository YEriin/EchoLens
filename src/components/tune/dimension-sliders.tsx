"use client";

import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAppStore } from "@/stores/app-store";
import type { TuneDimension } from "@/types/tune";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const DIMENSIONS: {
  key: TuneDimension;
  label: string;
  leftLabel: string;
  rightLabel: string;
}[] = [
  { key: "formality", label: "正式度", leftLabel: "朋友闲聊", rightLabel: "董事会邮件" },
  { key: "power", label: "权力关系", leftLabel: "对下级", rightLabel: "对上级/客户" },
  { key: "emotion", label: "情感温度", leftLabel: "冷静理性", rightLabel: "共情温暖" },
  { key: "cognition", label: "认知水平", leftLabel: "专业人士", rightLabel: "普通用户" },
];

export function DimensionSliders() {
  const tuneConfig = useAppStore((s) => s.tuneConfig);
  const setTuneConfig = useAppStore((s) => s.setTuneConfig);
  const isAnalyzing = useAppStore((s) => s.isAnalyzing);
  const [open, setOpen] = useState(false);

  const summary = DIMENSIONS.map(
    (d) => `${d.label} ${tuneConfig[d.key]}`
  ).join(" / ");

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-sm border border-border/60 bg-card hover:bg-muted/30 transition-colors text-left hand-card">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium shrink-0">调频道</span>
          <span className="text-xs text-muted-foreground truncate">
            {summary}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3 space-y-4 px-1">
        {DIMENSIONS.map((dim) => (
          <div key={dim.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{dim.label}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {tuneConfig[dim.key]}
              </span>
            </div>
            <Slider
              value={[tuneConfig[dim.key]]}
              onValueChange={([val]) => setTuneConfig({ [dim.key]: val })}
              min={0}
              max={100}
              step={1}
              disabled={isAnalyzing}
              className="w-full"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{dim.leftLabel}</span>
              <span>{dim.rightLabel}</span>
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
