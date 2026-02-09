import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { callClaude, parseJSONSafe } from "@/lib/anthropic";
import { SYSTEM_PROMPT } from "@/lib/prompts/system-prompt";
import { buildMirrorPrompt } from "@/lib/prompts/mirror-prompt";
import { buildTunePrompt } from "@/lib/prompts/tune-prompt";
import { PRESET_PERSONAS } from "@/lib/prompts/persona-definitions";
import { mirrorResultSchema } from "@/lib/schemas/mirror";
import { tuneConfigSchema, tuneResultSchema } from "@/lib/schemas/tune";
import { checkRateLimit } from "@/lib/rate-limiter";
import { applyMirrorRewrites, applyTuneEdits } from "@/lib/utils/rewrite";

const analyzeRequestSchema = z.object({
  message: z.string().min(1, "消息不能为空").max(2000, "消息最长 2000 字符"),
  conversationHistory: z.string().max(5000, "对话历史最长 5000 字符").optional(),
  layer: z.enum(["mirror", "tune", "both"]),
  personas: z.array(z.string()).default([]),
  tuneConfig: tuneConfigSchema.optional(),
  // Custom persona fragments from saved personas
  customPersonas: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        promptFragment: z.string(),
      })
    )
    .default([]),
});

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试（每分钟最多 10 次）" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = analyzeRequestSchema.parse(body);

    const results: {
      mirror?: z.infer<typeof mirrorResultSchema>;
      tune?: z.infer<typeof tuneResultSchema>;
      correctedMessage?: string;
    } = {};

    // Build persona info for Mirror
    const personaInfos = parsed.personas
      .map((id) => {
        const preset = PRESET_PERSONAS.find((p) => p.id === id);
        if (preset) return { id: preset.id, name: preset.name, promptFragment: preset.promptFragment };
        const custom = parsed.customPersonas.find((p) => p.id === id);
        if (custom) return { id: custom.id, name: custom.name, promptFragment: custom.promptFragment };
        return null;
      })
      .filter(Boolean) as { id: string; name: string; promptFragment: string }[];

    // Execute analysis based on layer
    const promises: Promise<void>[] = [];

    if ((parsed.layer === "mirror" || parsed.layer === "both") && personaInfos.length > 0) {
      promises.push(
        (async () => {
          const prompt = buildMirrorPrompt(parsed.message, personaInfos, parsed.conversationHistory);
          const raw = await callClaude(SYSTEM_PROMPT, prompt);
          const json = parseJSONSafe(raw);
          results.mirror = mirrorResultSchema.parse(json);
        })()
      );
    }

    if ((parsed.layer === "tune" || parsed.layer === "both") && parsed.tuneConfig) {
      promises.push(
        (async () => {
          const prompt = buildTunePrompt(parsed.message, parsed.tuneConfig!, parsed.conversationHistory);
          const raw = await callClaude(SYSTEM_PROMPT, prompt);
          const json = parseJSONSafe(raw);
          results.tune = tuneResultSchema.parse(json);
        })()
      );
    }

    await Promise.all(promises);

    // ── Serial rewrite pipeline: Mirror → Tune ──────────────────
    // Display results (mirror, tune) stay based on original message.
    // correctedMessage = Mirror content fix → Tune expression fix.
    if (results.mirror && parsed.tuneConfig) {
      const annotations = results.mirror.personas[0]?.annotations ?? [];
      const mirrorCorrected = applyMirrorRewrites(parsed.message, annotations);

      if (mirrorCorrected !== parsed.message) {
        // Mirror changed the text → run Tune again on the corrected version
        const retunePrompt = buildTunePrompt(mirrorCorrected, parsed.tuneConfig, parsed.conversationHistory);
        const retuneRaw = await callClaude(SYSTEM_PROMPT, retunePrompt);
        const retuneJson = parseJSONSafe(retuneRaw);
        const retune = tuneResultSchema.parse(retuneJson);
        results.correctedMessage = applyTuneEdits(mirrorCorrected, retune.offtuneWords);
      } else if (results.tune) {
        // Mirror didn't change anything → reuse display Tune's word edits
        results.correctedMessage = applyTuneEdits(parsed.message, results.tune.offtuneWords);
      }
    } else if (results.tune) {
      // No Mirror → just apply Tune word edits on original
      results.correctedMessage = applyTuneEdits(parsed.message, results.tune.offtuneWords);
    } else if (results.mirror) {
      // No Tune → just apply Mirror rewrites
      const annotations = results.mirror.personas[0]?.annotations ?? [];
      const mirrorCorrected = applyMirrorRewrites(parsed.message, annotations);
      if (mirrorCorrected !== parsed.message) {
        results.correctedMessage = mirrorCorrected;
      }
    }

    // Don't return correctedMessage if it's identical to original
    if (results.correctedMessage === parsed.message) {
      delete results.correctedMessage;
    }

    return NextResponse.json(results);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "输入参数有误", details: err.issues.map((i) => i.message) },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : "未知错误";
    console.error("Analyze API error:", err);

    if (message.includes("api_key") || message.includes("authentication")) {
      return NextResponse.json({ error: "API Key 配置无效，请检查环境变量" }, { status: 500 });
    }

    return NextResponse.json({ error: `分析失败：${message}` }, { status: 500 });
  }
}
