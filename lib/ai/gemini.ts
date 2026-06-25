import { GoogleGenAI } from "@google/genai";

/** When true, outfit generation uses rules only and tagging is skipped. */
export function isGeminiRulesOnly(): boolean {
  const value = process.env.GEMINI_RULES_ONLY?.toLowerCase();
  return value === "true" || value === "1";
}

const RETRYABLE_STATUS = new Set([500, 503, 504]);

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({ apiKey });
}

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

export function isQuotaOrRateLimitError(error: unknown): boolean {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;
    if (status === 429 || status === 403) return true;
  }
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  const status = extractStatusCode(message);
  return (
    status === 429 ||
    status === 403 ||
    message.includes("rate limit") ||
    message.includes("resource exhausted") ||
    message.includes("quota")
  );
}

/** True when Gemini cannot run (quota, rules-only, or tagging disabled). */
export function isGeminiUnavailableError(error: unknown): boolean {
  if (isGeminiRulesOnly()) return true;
  if (isQuotaOrRateLimitError(error)) return true;
  if (
    error instanceof Error &&
    error.message.includes("AI tagging is disabled")
  ) {
    return true;
  }
  return false;
}

function isRetryableError(error: unknown): boolean {
  if (isQuotaOrRateLimitError(error)) return false;
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    RETRYABLE_STATUS.has(extractStatusCode(message)) ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("unavailable")
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
