import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

type RouteSupabase = SupabaseClient<Database>;

export async function getRouteUserId(
  supabase: RouteSupabase,
): Promise<string | null> {
  const [{ data: claimsData }, { data: userData }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.auth.getUser(),
  ]);
  return userData.user?.id ?? (claimsData?.claims?.sub as string | undefined) ?? null;
}

export function isUserImagePath(userId: string, imagePath: string): boolean {
  const normalized = imagePath.replace(/^\/+/, "");
  return normalized.startsWith(`${userId}/`) && !normalized.includes("..");
}
