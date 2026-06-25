import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSavedOutfitById } from "@/lib/outfits/get-outfit";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();

    if (!claimsData?.claims?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = claimsData.claims.sub as string;
    const outfit = await getSavedOutfitById(supabase, userId, id);

    if (!outfit) {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
    }

    return NextResponse.json(outfit);
  } catch (error) {
    console.error("Get outfit error:", error);
    return NextResponse.json({ error: "Failed to load outfit" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();

    if (!claimsData?.claims?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = claimsData.claims.sub as string;
    const body = await request.json();
    const updates: { is_favorite?: boolean; name?: string } = {};

    if (typeof body.is_favorite === "boolean") {
      updates.is_favorite = body.is_favorite;
    }
    if (typeof body.name === "string") {
      updates.name = body.name;
    }

    const { data, error } = await supabase
      .from("outfits")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update outfit error:", error);
    return NextResponse.json({ error: "Failed to update outfit" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();

    if (!claimsData?.claims?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = claimsData.claims.sub as string;

    const { error } = await supabase
      .from("outfits")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete outfit error:", error);
    return NextResponse.json({ error: "Failed to delete outfit" }, { status: 500 });
  }
}
