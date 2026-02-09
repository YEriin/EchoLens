"use client";

import { useAppStore } from "@/stores/app-store";
import { PersonaCard } from "./persona-card";
import { ChatImport } from "./chat-import";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function PersonaLibrary() {
  const savedPersonas = useAppStore((s) => s.savedPersonas);
  const personaLabOpen = useAppStore((s) => s.personaLabOpen);
  const setPersonaLabOpen = useAppStore((s) => s.setPersonaLabOpen);

  return (
    <Dialog open={personaLabOpen} onOpenChange={setPersonaLabOpen}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] grid-rows-[auto_1fr]">
        <DialogHeader>
          <DialogTitle>读心术 — 人格实验室</DialogTitle>
          <DialogDescription>
            粘贴你和某人的聊天记录，AI 会分析对方的沟通风格，生成专属人格卡片。保存后可在分析时选用。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto min-h-0">
          <ChatImport />

          {savedPersonas.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">已保存的人格卡片</h4>
              {savedPersonas.map((persona) => (
                <PersonaCard key={persona.id} persona={persona} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
