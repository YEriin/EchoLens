"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { useState } from "react";

export function ChatImport() {
  const [chatHistory, setChatHistory] = useState("");
  const [name, setName] = useState("");
  const generatePersona = useAppStore((s) => s.generatePersona);
  const isGenerating = useAppStore((s) => s.isGeneratingPersona);

  const handleGenerate = async () => {
    if (!chatHistory.trim()) return;
    await generatePersona(chatHistory.trim(), name.trim() || undefined);
    setChatHistory("");
    setName("");
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="对方的名字（可选，如：张总）"
          className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
          disabled={isGenerating}
        />
        <Textarea
          value={chatHistory}
          onChange={(e) => setChatHistory(e.target.value)}
          placeholder="粘贴你和对方的聊天记录...&#10;&#10;越多越好，建议 20 条以上消息，AI 才能准确捕捉对方的沟通风格。"
          className="min-h-[120px] resize-none text-sm"
          disabled={isGenerating}
        />
      </div>
      <Button
        onClick={handleGenerate}
        disabled={!chatHistory.trim() || chatHistory.trim().length < 10 || isGenerating}
        variant="outline"
        className="w-full"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            生成中...
          </span>
        ) : (
          "生成沟通人格卡片"
        )}
      </Button>
    </div>
  );
}
