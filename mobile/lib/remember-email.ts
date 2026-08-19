import { appStorage } from "@/lib/supabase";
import { REMEMBER_EMAIL_KEY } from "@shared/auth/constants";

export async function getRememberedEmail(): Promise<string> {
  return (await appStorage.getItem(REMEMBER_EMAIL_KEY)) ?? "";
}

export async function writeRememberedEmail(email: string | null): Promise<void> {
  if (email) {
    await appStorage.setItem(REMEMBER_EMAIL_KEY, email);
    return;
  }
  await appStorage.removeItem(REMEMBER_EMAIL_KEY);
}
