const RETRYABLE_STATUS = new Set([429, 500, 503, 504]);

export function getOutfitModel(): string {
  return (
    process.env.GEMINI_OUTFIT_MODEL ??
    process.env.GEMINI_MODEL ??
    "gemini-2.0-flash"
  );
}

export function getTagModel(): string {
  return (
    process.env.GEMINI_TAG_MODEL ??
    process.env.GEMINI_MODEL ??
    "gemini-2.0-flash"
  );
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    RETRYABLE_STATUS.has(extractStatusCode(message)) ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("unavailable") ||
    message.includes("resource exhausted") ||
    message.includes("rate limit")
  );
}

function extractStatusCode(message: string): number {
  const match = message.match(/\b(429|500|503|504)\b/);
  return match ? Number(match[1]) : 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withGeminiRetry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1000;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt === maxAttempts) {
        throw error;
      }
      await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}
