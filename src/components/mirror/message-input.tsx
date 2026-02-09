"use client";

import { PenLine } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/stores/app-store";

export function MessageInput() {
  const message = useAppStore((s) => s.message);
  const setMessage = useAppStore((s) => s.setMessage);
  const isAnalyzing = useAppStore((s) => s.isAnalyzing);

  const charCount = message.length;
  const isOverLimit = charCount > 2000;

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center gap-2 shrink-0">
        <PenLine className="w-4 h-4 text-muted-foreground" />
        <label className="text-sm font-medium text-foreground">
          准备回复的内容
        </label>
      </div>
      <div className="relative flex-1">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="粘贴你准备发出的消息..."
          className="h-full resize-none field-sizing-fixed text-[15px] leading-relaxed pr-16 notebook-lines"
          disabled={isAnalyzing}
        />
        <span
          className={`absolute bottom-3 right-3 text-xs ${
            isOverLimit ? "text-red-500 font-medium" : "text-muted-foreground"
          }`}
        >
          {charCount}/2000
        </span>
      </div>
    </div>
  );
}
