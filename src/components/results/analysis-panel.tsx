"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/stores/app-store";
import { MonologueCard } from "@/components/mirror/monologue-card";
import { InlineRewrite } from "@/components/mirror/inline-rewrite";
import { RegisterScore } from "@/components/tune/register-score";
import { OfftuneAnnotation } from "@/components/tune/offtune-annotation";
import { motion } from "framer-motion";

export function AnalysisPanel() {
  const mirrorResult = useAppStore((s) => s.mirrorResult);
  const tuneResult = useAppStore((s) => s.tuneResult);
  const activeResultTab = useAppStore((s) => s.activeResultTab);
  const setActiveResultTab = useAppStore((s) => s.setActiveResultTab);

  if (!mirrorResult && !tuneResult) return null;

  const persona = mirrorResult?.personas[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <Tabs
        value={activeResultTab}
        onValueChange={(v) => setActiveResultTab(v as "monologue" | "register")}
      >
        <TabsList className="w-full">
          {mirrorResult && <TabsTrigger value="monologue" className="flex-1">内心独白</TabsTrigger>}
          {tuneResult && <TabsTrigger value="register" className="flex-1">语域分析</TabsTrigger>}
        </TabsList>

        {mirrorResult && persona && (
          <TabsContent value="monologue" className="space-y-4 mt-4">
            <MonologueCard monologue={persona} />

            {persona.annotations.some((a) => a.risk !== "green") && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">改写建议</h4>
                {persona.annotations
                  .filter((a) => a.risk !== "green")
                  .sort((a, b) => a.sentenceIndex - b.sentenceIndex)
                  .map((ann) => (
                    <InlineRewrite key={ann.sentenceIndex} annotation={ann} />
                  ))}
              </div>
            )}
          </TabsContent>
        )}

        {tuneResult && (
          <TabsContent value="register" className="space-y-6 mt-4">
            <RegisterScore result={tuneResult} />
            <OfftuneAnnotation words={tuneResult.offtuneWords} />
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
}
