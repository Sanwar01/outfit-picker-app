import type { SupabaseClient } from "@supabase/supabase-js";

export async function getItemImagePaths(
  supabase: SupabaseClient,
  itemId: string,
  primaryPath: string
): Promise<string[]> {
  const { data: extraImages } = await supabase
    .from("clothing_item_images")
    .select("image_url")
    .eq("clothing_item_id", itemId)
    .order("sort_order", { ascending: true });

  const paths = [primaryPath];
  for (const row of extraImages ?? []) {
    if (!paths.includes(row.image_url)) {
      paths.push(row.image_url);
    }
  }
  return paths;
}
