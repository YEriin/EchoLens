/**
 * Split CJK + English text into sentences.
 */
export function splitSentences(text: string): string[] {
  if (!text.trim()) return [];

  // Split on Chinese and English sentence-ending punctuation
  // Keep the punctuation attached to the sentence
  const segments = text.split(/((?:[^。！？!?\n]+[。！？!?])|(?:[^\n]+(?:\n|$)))/g);

  const sentences: string[] = [];
  for (const seg of segments) {
    const trimmed = seg.trim();
    if (trimmed.length > 0) {
      sentences.push(trimmed);
    }
  }

  // If no splits happened, return the whole text as one sentence
  if (sentences.length === 0 && text.trim()) {
    return [text.trim()];
  }

  return sentences;
}
