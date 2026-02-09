"use client";

import { MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/stores/app-store";

export function ConversationInput() {
  const conversationHistory = useAppStore((s) => s.conversationHistory);
  const setConversationHistory = useAppStore((s) => s.setConversationHistory);
  const isAnalyzing = useAppStore((s) => s.isAnalyzing);

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center gap-2 shrink-0">
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
        <label className="text-sm font-medium text-foreground">
          对话历史
        </label>
        <span className="text-xs text-muted-foreground">（可选）</span>
      </div>
      <Textarea
        value={conversationHistory}
        onChange={(e) => setConversationHistory(e.target.value)}
        placeholder={"粘贴之前的对话记录，帮助 AI 更准确地理解语境...\n\n例如：\nA: 这个方案你们什么时候能给？\nB: 我们内部讨论一下\nA: 好的，尽快"}
        className="flex-1 resize-none text-[14px] leading-relaxed notebook-lines"
        disabled={isAnalyzing}
      />
    </div>
  );
}
