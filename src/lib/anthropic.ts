import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

export async function callClaude(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const anthropic = getAnthropicClient();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
      {
        role: "assistant",
        content: "{",
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Prepend the "{" we used as prefill
  return "{" + textBlock.text;
}

/**
 * Robust JSON parsing: try multiple strategies in order.
 * Throws with context on all failures.
 */
export function parseJSONSafe(raw: string): unknown {
  // Strategy 1: direct parse
  try {
    return JSON.parse(raw);
  } catch {
    // continue
  }

  // Strategy 2: extract from markdown code block then clean
  const extracted = extractJSON(raw);
  try {
    return JSON.parse(extracted);
  } catch {
    // continue
  }

  // Strategy 3: heavy clean (newlines, trailing commas, etc.)
  const cleaned = deepCleanJSON(extracted);
  try {
    return JSON.parse(cleaned);
  } catch {
    // continue
  }

  // Strategy 4: truncate to last balanced brace
  const balanced = balanceBraces(cleaned);
  try {
    return JSON.parse(balanced);
  } catch (err) {
    const snippet = raw.slice(0, 300);
    throw new Error(
      `JSON 解析失败（已尝试 4 种策略）: ${err instanceof Error ? err.message : err}\n--- raw preview ---\n${snippet}`
    );
  }
}

/**
 * Extract the JSON object from possible markdown / surrounding text.
 */
export function extractJSON(text: string): string {
  // Try markdown code block first
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Find the outermost { ... } (greedy)
  const start = text.indexOf("{");
  if (start === -1) return text;

  // Walk forward to find the matching closing brace
  let depth = 0;
  let inStr = false;
  let end = start;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (ch === "\\") {
        i++; // skip escaped char
        continue;
      }
      if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  return text.slice(start, end + 1);
}

/**
 * Deep-clean LLM JSON output:
 * - escape raw newlines / tabs inside string values
 * - strip trailing commas
 * - remove control characters
 */
function deepCleanJSON(text: string): string {
  // 1. Remove control characters (keep \n \r \t)
  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

  // 2. Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");

  // 3. Walk through and escape raw newlines/tabs inside string values
  let result = "";
  let inString = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (ch === "\\") {
        // Preserve valid escape, fix bad ones
        const next = cleaned[i + 1];
        if (next && `"\\\/bfnrtu`.includes(next)) {
          result += ch + next;
        } else {
          // Invalid escape like \g — keep the char after backslash, drop the backslash
          result += next ?? "";
        }
        i++;
        continue;
      }
      if (ch === '"') {
        inString = false;
        result += ch;
        continue;
      }
      if (ch === "\n") {
        result += "\\n";
        continue;
      }
      if (ch === "\r") {
        continue;
      }
      if (ch === "\t") {
        result += "\\t";
        continue;
      }
      result += ch;
    } else {
      if (ch === '"') inString = true;
      result += ch;
    }
  }

  return result;
}

/**
 * If the JSON is truncated (unbalanced braces), try to close it.
 */
function balanceBraces(text: string): string {
  let depth = 0;
  let arrDepth = 0;
  let inStr = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (ch === "\\") { i++; continue; }
      if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (ch === "[") arrDepth++;
    if (ch === "]") arrDepth--;
  }

  // If still inside a string, close it
  let result = text;
  if (inStr) result += '"';

  // Close unclosed arrays then objects
  while (arrDepth > 0) { result += "]"; arrDepth--; }
  while (depth > 0) { result += "}"; depth--; }

  return result;
}
