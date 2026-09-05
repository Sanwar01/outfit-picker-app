import { appStorage } from "@/services/supabase";

const KEY = "wardrobe_has_seen_welcome";

export async function getHasSeenWelcome(): Promise<boolean> {
  return (await appStorage.getItem(KEY)) === "1";
}

export async function setHasSeenWelcome(): Promise<void> {
  await appStorage.setItem(KEY, "1");
}
