import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignedImageUrls } from "@/lib/storage";
import { AppShell } from "@/components/layout/app-shell";
import { ClothingGrid } from "@/components/wardrobe/clothing-grid";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function WardrobePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub as string;

  const { data: items } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const paths = (items ?? []).map((item) => item.image_url);
  let imageUrls: Record<string, string> = {};

  if (paths.length > 0) {
    try {
      imageUrls = await getSignedImageUrls(paths);
    } catch {
      // Admin credentials may be missing in dev
    }
  }

  return (
    <AppShell>
      <div className="px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Wardrobe</h1>
            <p className="text-sm text-stone-500">
              {(items ?? []).filter((i) => i.status === "active").length} items
            </p>
          </div>
          <Button size="sm" className="rounded-xl" render={<Link href="/wardrobe/add" />}>
            Add
          </Button>
        </div>

        <ClothingGrid
          items={items ?? []}
          imageUrls={imageUrls}
          userId={userId}
        />
      </div>
    </AppShell>
  );
}
