import { NextResponse } from "next/server";
import type { UsageMeter } from "@/lib/billing/plans";

export type QuotaExceededBody = {
  error: "quota_exceeded";
  meter: UsageMeter;
  limit: number;
  used: number;
  resetAt?: string | null;
};

export class QuotaExceededError extends Error {
  readonly body: QuotaExceededBody;

  constructor(body: Omit<QuotaExceededBody, "error">) {
    super("quota_exceeded");
    this.name = "QuotaExceededError";
    this.body = { error: "quota_exceeded", ...body };
  }
}

export function quotaExceededResponse(error: QuotaExceededError) {
  return NextResponse.json(error.body, { status: 403 });
}

export function isQuotaExceededError(
  error: unknown,
): error is QuotaExceededError {
  return error instanceof QuotaExceededError;
}
