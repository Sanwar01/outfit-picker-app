import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRouteClient } from "@/lib/supabase/route-client";
import { generateOutfitForUser } from "@/lib/outfits/generate";
import type { OccasionId } from "@/lib/today/occasions";
import { PICKABLE_OCCASIONS } from "@/lib/today/occasions";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteClient(request);
    const [{ data: claimsData }, { data: userData }] = await Promise.all([
      supabase.auth.getClaims(),
      supabase.auth.getUser(),
    ]);
    const userId = userData.user?.id ?? claimsData?.claims?.sub ?? null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
