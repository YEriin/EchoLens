import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { callClaude, parseJSONSafe } from "@/lib/anthropic";
import { SYSTEM_PROMPT } from "@/lib/prompts/system-prompt";
import { buildPersonaGenPrompt } from "@/lib/prompts/persona-gen-prompt";
import { personaGenerateRequestSchema, personaGenerateResultSchema } from "@/lib/schemas/persona";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
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
    const parsed = personaGenerateRequestSchema.parse(body);

    const prompt = buildPersonaGenPrompt(parsed.chatHistory, parsed.name);
    const raw = await callClaude(SYSTEM_PROMPT, prompt);
    const json = parseJSONSafe(raw);
    const result = personaGenerateResultSchema.parse(json);

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "输入参数有误", details: err.issues.map((i) => i.message) },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : "未知错误";
    console.error("Persona API error:", err);

    if (message.includes("api_key") || message.includes("authentication")) {
      return NextResponse.json({ error: "API Key 配置无效，请检查环境变量" }, { status: 500 });
    }

    return NextResponse.json({ error: `人格生成失败：${message}` }, { status: 500 });
  }
}
