"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { ConversationInput } from "@/components/context/conversation-input";
import { MessageInput } from "@/components/mirror/message-input";
import { PersonaSelector } from "@/components/mirror/persona-selector";
import { DimensionSliders } from "@/components/tune/dimension-sliders";
import { AnnotatedMessage } from "@/components/results/annotated-message";
import { AnalysisPanel } from "@/components/results/analysis-panel";
import { RewritePanel } from "@/components/results/rewrite-panel";
import { PersonaLibrary } from "@/components/persona/persona-library";
import { LoadingSkeleton } from "@/components/results/loading-skeleton";
import { ErrorDisplay } from "@/components/results/error-display";
import { useAppStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageSquareText } from "lucide-react";

export default function Home() {
  const initPersonas = useAppStore((s) => s.initPersonas);
  const isAnalyzing = useAppStore((s) => s.isAnalyzing);
  const mirrorResult = useAppStore((s) => s.mirrorResult);
  const tuneResult = useAppStore((s) => s.tuneResult);
  const message = useAppStore((s) => s.message);
  const selectedPersona = useAppStore((s) => s.selectedPersona);
  const analyze = useAppStore((s) => s.analyze);

  const hasResults = mirrorResult || tuneResult;

  useEffect(() => {
    initPersonas();
  }, [initPersonas]);

  const charCount = message.length;
  const isOverLimit = charCount > 2000;
  const canAnalyze =
    message.trim().length > 0 &&
    !isOverLimit &&
    !isAnalyzing &&
    selectedPersona !== null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
        {/* LEFT: Input area */}
        <div className="flex flex-col overflow-hidden" style={{ borderRight: '2px dashed var(--border)', filter: 'url(#sketchy)' }}>
          {/* Top: Conversation history (flex-1) */}
          <div className="flex-1 overflow-hidden p-4">
            <ConversationInput />
          </div>
          <Separator className="bg-border/40" />
          {/* Bottom: Reply input (~40%) */}
          <div className="flex-none h-[40%] p-4">
            <MessageInput />
          </div>
        </div>

        {/* RIGHT: Config + Results */}
        <div className="flex flex-col overflow-hidden">
          {/* Top: Config area (flex-none) */}
          <div className="flex-none p-4 border-b border-border/40 space-y-3">
            <PersonaSelector />
            <DimensionSliders />
            <Button
              onClick={analyze}
              disabled={!canAnalyze}
              className="w-full h-10 text-[15px] font-medium bg-primary text-primary-foreground hand-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  分析中...
                </span>
              ) : (
                "开始分析"
              )}
            </Button>
          </div>

          {/* Bottom: Results area (flex-1, scrollable) */}
          <div className="flex-1 overflow-y-auto p-4">
            <ErrorDisplay />
            {isAnalyzing && <LoadingSkeleton />}
            {!isAnalyzing && hasResults && (
              <div className="space-y-6">
                <AnnotatedMessage />
                <AnalysisPanel />
                <RewritePanel />
              </div>
            )}
            {!hasResults && !isAnalyzing && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground space-y-2 rotate-[-0.5deg]">
                  <MessageSquareText className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-sm">输入消息并点击「开始分析」</p>
                  <p className="text-xs">结果将在这里显示</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PersonaLibrary Dialog (rendered outside of layout flow) */}
      <PersonaLibrary />
    </div>
  );
}
