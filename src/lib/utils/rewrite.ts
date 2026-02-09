import type { RiskAnnotation } from "@/types/mirror";
import type { OfftuneWord } from "@/types/tune";

interface TextEdit {
  start: number;
  end: number;
  replacement: string;
}

/**
 * Find `word` in `text` at (or nearest to) `reportedPos`,
 * skipping ranges already claimed by earlier edits.
 */
function resolvePosition(
  text: string,
  word: string,
  reportedPos: number,
  claimed: TextEdit[]
): number {
  const available = (s: number) => {
    const e = s + word.length;
    return !claimed.some((c) => s < c.end && e > c.start);
  };

  // 1. Try the position the AI reported
  if (
    text.slice(reportedPos, reportedPos + word.length) === word &&
    available(reportedPos)
  ) {
    return reportedPos;
  }

  // 2. Fallback: nearest unclaimed occurrence
  let best = -1;
  let bestDist = Infinity;
  let from = 0;
  while (from <= text.length - word.length) {
    const idx = text.indexOf(word, from);
    if (idx === -1) break;
    if (available(idx)) {
      const dist = Math.abs(idx - reportedPos);
      if (dist < bestDist) {
        bestDist = dist;
        best = idx;
      }
    }
    from = idx + 1;
  }
  return best;
}

/**
 * Apply Mirror sentence-level rewrites (non-green) to the original message.
 * Returns the intermediate text with content fixes applied.
 */
export function applyMirrorRewrites(
  message: string,
  annotations: RiskAnnotation[]
): string {
  const nonGreen = annotations.filter((ann) => ann.risk !== "green");
  if (nonGreen.length === 0) return message;

  const edits: TextEdit[] = [];
  for (const ann of nonGreen) {
    const start = message.indexOf(ann.sentence);
    if (start === -1) continue;
    edits.push({ start, end: start + ann.sentence.length, replacement: ann.rewrite });
  }

  // Apply from end to start so positions stay valid
  edits.sort((a, b) => b.start - a.start);
  let result = message;
  for (const edit of edits) {
    result = result.slice(0, edit.start) + edit.replacement + result.slice(edit.end);
  }
  return result;
}

/**
 * Apply Tune word-level edits on a given text.
 * Position-aware: resolves AI-reported positions to actual occurrences.
 */
export function applyTuneEdits(
  text: string,
  offtuneWords: OfftuneWord[]
): string {
  if (offtuneWords.length === 0) return text;

  const edits: TextEdit[] = [];
  for (const ow of offtuneWords) {
    if (!ow.replacement) continue;
    const start = resolvePosition(text, ow.word, ow.position, edits);
    if (start === -1) continue;
    edits.push({ start, end: start + ow.word.length, replacement: ow.replacement });
  }

  edits.sort((a, b) => b.start - a.start);
  let result = text;
  for (const edit of edits) {
    result = result.slice(0, edit.start) + edit.replacement + result.slice(edit.end);
  }
  return result;
}
