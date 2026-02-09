"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/stores/app-store";
import { useState } from "react";
import { motion } from "framer-motion";

export function RewritePanel() {
  const correctedMessage = useAppStore((s) => s.correctedMessage);
  const [copied, setCopied] = useState(false);

  if (!correctedMessage) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(correctedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, rotate: -0.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-green-300/50 bg-green-50/20">
        <CardContent className="pt-4 pb-4 px-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">修正后的回复</h3>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleCopy}
            >
              {copied ? "已复制 ✓" : "一键复制"}
            </Button>
          </div>
          <div className="p-3 rounded-sm bg-card border border-green-300/40 text-sm leading-relaxed">
            {correctedMessage}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
