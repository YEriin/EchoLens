"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/app-store";
import type { RiskAnnotation } from "@/types/mirror";
import type { OfftuneWord } from "@/types/tune";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HandHighlight } from "@/components/ui/hand-highlight";
import { cn } from "@/lib/utils";


const RISK_EMOJI: Record<string, string> = {
  red: "🔴",
  yellow: "🟡",
  green: "🟢",
};

export function AnnotatedMessage() {
  const mirrorResult = useAppStore((s) => s.mirrorResult);
  const tuneResult = useAppStore((s) => s.tuneResult);
  const message = useAppStore((s) => s.message);
  const acceptedRewrites = useAppStore((s) => s.acceptedRewrites);

  if (!mirrorResult && !tuneResult) return null;

  // Single persona annotations
  const annotations = mirrorResult?.personas[0]?.annotations
    ?.slice()
    .sort((a, b) => a.sentenceIndex - b.sentenceIndex) ?? [];

  // Offtune words for overlay
  const offtuneWords = tuneResult?.offtuneWords ?? [];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">原文标注</h3>
      <TooltipProvider delayDuration={200}>
        <div className="p-4 rounded-sm border border-border/60 bg-card hand-card space-y-1.5 text-[15px] leading-relaxed">
          {annotations.length > 0 ? (
            annotations.map((ann) => {
              const isAccepted = acceptedRewrites.has(ann.sentenceIndex);
              const displayText = isAccepted
                ? acceptedRewrites.get(ann.sentenceIndex)!
                : ann.sentence;

              return (
                <SentenceAnnotation
                  key={ann.sentenceIndex}
                  ann={ann}
                  isAccepted={isAccepted}
                  displayText={displayText}
                  offtuneWords={offtuneWords}
                />
              );
            })
          ) : (
            <AnnotatedSentence text={message} offtuneWords={offtuneWords} onWordHover={() => {}} />
          )}
        </div>
      </TooltipProvider>

    </div>
  );
}

/** Coordinates sentence-level and word-level tooltips so only one shows at a time. */
function SentenceAnnotation({
  ann,
  isAccepted,
  displayText,
  offtuneWords,
}: {
  ann: RiskAnnotation;
  isAccepted: boolean;
  displayText: string;
  offtuneWords: OfftuneWord[];
}) {
  const [open, setOpen] = useState(false);
  const [wordHovered, setWordHovered] = useState(false);

  return (
    <Tooltip open={open && !wordHovered} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline rounded-sm px-0.5 cursor-help",
            isAccepted && "bg-green-100"
          )}
        >
          {isAccepted ? "✅" : RISK_EMOJI[ann.risk]}{" "}
          {!isAccepted && ann.risk === "red" ? (
            <HandHighlight type="highlight" color="rgba(220, 80, 60, 0.2)">
              <AnnotatedSentence text={displayText} offtuneWords={offtuneWords} onWordHover={setWordHovered} />
            </HandHighlight>
          ) : !isAccepted && ann.risk === "yellow" ? (
            <HandHighlight type="underline" color="rgba(200, 140, 30, 0.6)" strokeWidth={3}>
              <AnnotatedSentence text={displayText} offtuneWords={offtuneWords} onWordHover={setWordHovered} />
            </HandHighlight>
          ) : (
            <AnnotatedSentence text={displayText} offtuneWords={offtuneWords} onWordHover={setWordHovered} />
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-sm">
        <p className="text-xs">
          {isAccepted ? "已改写" : ann.reason}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

function AnnotatedSentence({
  text,
  offtuneWords,
  onWordHover,
}: {
  text: string;
  offtuneWords: OfftuneWord[];
  onWordHover: (hovered: boolean) => void;
}) {
  if (offtuneWords.length === 0) return <>{text}</>;

  // Find offtune words in this sentence
  const matches: { start: number; end: number; word: OfftuneWord }[] = [];
  for (const ow of offtuneWords) {
    const idx = text.indexOf(ow.word);
    if (idx !== -1) {
      matches.push({ start: idx, end: idx + ow.word.length, word: ow });
    }
  }

  if (matches.length === 0) return <>{text}</>;

  matches.sort((a, b) => a.start - b.start);

  // Deduplicate overlapping matches — keep the first match at each position
  const deduped: typeof matches = [];
  for (const m of matches) {
    if (deduped.length === 0 || m.start >= deduped[deduped.length - 1].end) {
      deduped.push(m);
    }
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (let i = 0; i < deduped.length; i++) {
    const m = deduped[i];
    if (m.start > cursor) {
      parts.push(text.slice(cursor, m.start));
    }
    parts.push(
      <Tooltip key={`${m.start}-${i}`}>
        <TooltipTrigger asChild>
          <span
            className="underline decoration-wavy decoration-amber-600 underline-offset-4 cursor-help"
            onPointerEnter={() => onWordHover(true)}
            onPointerLeave={() => onWordHover(false)}
          >
            {m.word.word}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-xs font-medium">{m.word.issue}</p>
          <p className="text-xs text-muted-foreground mt-1">{m.word.suggestion}</p>
        </TooltipContent>
      </Tooltip>
    );
    cursor = m.end;
  }
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <>{parts}</>;
}
