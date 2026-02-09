"use client";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";

export function ErrorDisplay() {
  const error = useAppStore((s) => s.error);
  const clearResults = useAppStore((s) => s.clearResults);

  if (!error) return null;

  return (
    <div className="p-4 rounded-sm border border-red-300/50 bg-red-50/40 hand-card">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-red-800">分析出错</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-red-600 hover:bg-red-100 shrink-0"
          onClick={clearResults}
        >
          关闭
        </Button>
      </div>
    </div>
  );
}
