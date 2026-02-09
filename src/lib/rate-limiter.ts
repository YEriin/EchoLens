const requests = new Map<string, number[]>();
const MAX_REQUESTS = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = requests.get(key) ?? [];

  // Remove expired timestamps
  const valid = timestamps.filter((t) => now - t < WINDOW_MS);

  if (valid.length >= MAX_REQUESTS) {
    requests.set(key, valid);
    return { allowed: false, remaining: 0 };
  }

  valid.push(now);
  requests.set(key, valid);
  return { allowed: true, remaining: MAX_REQUESTS - valid.length };
}
