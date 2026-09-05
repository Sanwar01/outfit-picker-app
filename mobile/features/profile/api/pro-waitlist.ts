import { appStorage } from "@/services/supabase";

const KEY = "outfit_picker_pro_waitlist";

export async function getJoinedProWaitlist(): Promise<boolean> {
  return (await appStorage.getItem(KEY)) === "1";
}

export async function setJoinedProWaitlist(): Promise<void> {
  await appStorage.setItem(KEY, "1");
}
