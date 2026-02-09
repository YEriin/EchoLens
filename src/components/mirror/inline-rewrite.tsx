"use client";

import { Button } from "@/components/ui/button";
import type { RiskAnnotation } from "@/types/mirror";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface InlineRewriteProps {
  annotation: RiskAnnotation;
}

export function InlineRewrite({ annotation }: InlineRewriteProps) {
  const acceptRewrite = useAppStore((s) => s.acceptRewrite);
  const acceptedRewrites = useAppStore((s) => s.acceptedRewrites);
  const [expanded, setExpanded] = useState(false);

  const isAccepted = acceptedRewrites.has(annotation.sentenceIndex);

  if (annotation.risk === "green") return null;

  return (
    <div className="space-y-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full text-left p-2 rounded-sm text-sm transition-colors",
          annotation.risk === "red"
            ? "bg-red-50/60 hover:bg-red-50 border border-red-300/50"
            : "bg-amber-50/60 hover:bg-amber-50 border border-amber-300/50",
          isAccepted && "opacity-50"
        )}
      >
        <div className="flex items-start gap-2">
          <span>{annotation.risk === "red" ? "🔴" : "🟡"}</span>
          <div className="flex-1 min-w-0">
            <p className={cn("text-foreground", isAccepted && "line-through")}>
              {annotation.sentence}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{annotation.reason}</p>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && !isAccepted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-7 p-2 rounded-sm bg-green-50/60 border border-green-300/50 flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-green-800">{annotation.rewrite}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-green-700 hover:bg-green-100"
                  onClick={() => {
                    acceptRewrite(annotation.sentenceIndex, annotation.rewrite);
                    setExpanded(false);
                  }}
                >
                  接受
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={() => setExpanded(false)}
                >
                  忽略
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
