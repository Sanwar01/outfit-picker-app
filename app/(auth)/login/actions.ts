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

export async function loginWithPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const emailError = validateEmail(email);
  if (emailError) {
    redirect(`/login?error=${encodeURIComponent(emailError)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/today");
}

export async function signUpWithPassword(formData: FormData) {
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!fullName || fullName.length < 2) {
    redirect(
      `/signup?error=${encodeURIComponent("Please enter your full name.")}`
    );
  }

  if (formData.get("terms") !== "on") {
    redirect(
      `/signup?error=${encodeURIComponent("Please accept the terms to continue.")}`
    );
  }

  const emailError = validateEmail(email);
  if (emailError) {
    redirect(`/signup?error=${encodeURIComponent(emailError)}`);
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    redirect(`/signup?error=${encodeURIComponent(passwordError)}`);
  }

  if (password !== confirmPassword) {
    redirect(`/signup?error=${encodeURIComponent("Passwords do not match.")}`);
  }

  const normalizedEmail = normalizeEmail(email);
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        display_name: fullName,
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/today");
}

async function signInWithOAuth(
  provider: "google" | "apple",
  errorPath: "/login" | "/signup" = "/login"
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getAuthCallbackUrl("/today"),
    },
  });

  if (error) {
    redirect(`${errorPath}?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function loginWithGoogle() {
  await signInWithOAuth("google", "/login");
}

export async function loginWithApple() {
  await signInWithOAuth("apple", "/login");
}

export async function signUpWithGoogle() {
  await signInWithOAuth("google", "/signup");
}

export async function signUpWithApple() {
  await signInWithOAuth("apple", "/signup");
}

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
    }
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
      `/reset-password?error=${encodeURIComponent("Passwords do not match.")}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/today");
}
