"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeEmail, validateEmail } from "@/lib/auth/validation";
import type { AppPlatform } from "@/lib/marketing/app-links";

const PLATFORMS = new Set<AppPlatform>(["ios", "android", "both"]);

export type RequestInstallState = {
  ok: boolean;
  error?: string;
};

export async function requestInstall(
  _prev: RequestInstallState,
  formData: FormData,
): Promise<RequestInstallState> {
  const email = String(formData.get("email") ?? "");
  const platform = String(formData.get("platform") ?? "") as AppPlatform;

  const emailError = validateEmail(email);
  if (emailError) {
    return { ok: false, error: emailError };
  }

  if (!PLATFORMS.has(platform)) {
    return { ok: false, error: "Choose iPhone, Android, or both." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("install_requests").insert({
    email: normalizeEmail(email),
    platform,
  });

  if (error && error.code !== "23505") {
    console.error("install_requests insert failed:", error.message);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  return { ok: true };
}
