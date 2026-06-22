import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateOutfitForUser } from "@/lib/outfits/generate";
import type { OccasionId } from "@/lib/today/occasions";
import { PICKABLE_OCCASIONS } from "@/lib/today/occasions";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();

    if (!claimsData?.claims?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = claimsData.claims.sub as string;
    const body = await request.json().catch(() => ({}));
    const excludeCombinations =
      (body.excludeCombinations as string[][]) ?? [];
    const rawOccasion = (body.occasion as string) ?? "auto";
    const occasion: OccasionId = PICKABLE_OCCASIONS.some(
      (o) => o.id === rawOccasion
    )
      ? (rawOccasion as OccasionId)
      : rawOccasion === "auto"
        ? "auto"
        : "auto";

    const [{ data: profile }, { data: wardrobe }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase
        .from("clothing_items")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active"),
    ]);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const result = await generateOutfitForUser(
      wardrobe ?? [],
      profile,
      excludeCombinations,
      userId,
      occasion
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate outfit error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Outfit generation failed",
      },
      { status: 400 }
    );
  }
}
