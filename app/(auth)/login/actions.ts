"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthCallbackUrl } from "@/lib/auth/constants";
import {
  normalizeEmail,
  validateEmail,
  validatePassword,
} from "@/lib/auth/validation";

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  const emailError = validateEmail(email);
  if (emailError) {
    redirect(`/forgot-password?error=${encodeURIComponent(emailError)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    normalizeEmail(email),
    {
      redirectTo: getAuthCallbackUrl("/reset-password"),
    },
  );

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/forgot-password?sent=1");
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const passwordError = validatePassword(password);
  if (passwordError) {
    redirect(`/reset-password?error=${encodeURIComponent(passwordError)}`);
  }

  if (password !== confirmPassword) {
    redirect(
      `/reset-password?error=${encodeURIComponent("Passwords do not match.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}
