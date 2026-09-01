import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRouteUserId } from "@/lib/api/route-auth";
import { createRouteClient } from "@/lib/supabase/route-client";
import { isDraftItem } from "@/lib/wardrobe/draft-constants";
import { fetchDraftForUser } from "@/lib/wardrobe/draft-service";
import {
  pickDraftUpdate,
  type ClothingItemUpdate,
} from "@/lib/wardrobe/draft-update";
import type { ClothingCategory, ClothingFit } from "@/lib/types/database";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const CATEGORIES: ClothingCategory[] = [
  "top",
  "bottom",
  "outerwear",
  "shoes",
  "accessory",
];

const FITS: ClothingFit[] = ["regular", "slim", "relaxed", "oversized"];

function buildPatchUpdate(body: Record<string, unknown>): ClothingItemUpdate {
  const update: ClothingItemUpdate = {};

  if (typeof body.name === "string" && body.name.trim()) {
    update.name = body.name.trim();
  }
  if (CATEGORIES.includes(body.category as ClothingCategory)) {
    update.category = body.category as ClothingCategory;
  }
  if (typeof body.sub_category === "string") {
    update.sub_category = body.sub_category.trim() || null;
  }
  if (Array.isArray(body.colors)) {
    update.colors = body.colors.filter(
      (color: unknown): color is string =>
        typeof color === "string" && color.trim().length > 0,
    );
  }
  if (typeof body.pattern === "string") {
    update.pattern = body.pattern.trim() || "solid";
  }
  if (Array.isArray(body.season)) {
    update.season = body.season.filter(
      (season: unknown): season is string => typeof season === "string",
    );
  }
  if (
    typeof body.formality === "number" &&
    body.formality >= 1 &&
    body.formality <= 5
  ) {
    update.formality = body.formality;
  }
  if (Array.isArray(body.style_tags)) {
    update.style_tags = body.style_tags.filter(
      (tag: unknown): tag is string => typeof tag === "string",
    );
  }
  if (Array.isArray(body.occasions)) {
    update.occasions = body.occasions.filter(
      (occasion: unknown): occasion is string => typeof occasion === "string",
    );
  }
  if (typeof body.material === "string") {
    update.material = body.material.trim() || null;
  }
  if (typeof body.brand === "string") {
    update.brand = body.brand.trim() || null;
  }
  if (body.fit === null || FITS.includes(body.fit as ClothingFit)) {
    update.fit = body.fit as ClothingFit | null;
  }
  if (
    body.warmth === null ||
    (typeof body.warmth === "number" && body.warmth >= 1 && body.warmth <= 5)
  ) {
    update.warmth = body.warmth as number | null;
  }
  if (typeof body.size === "string") {
    update.size = body.size.trim() || null;
  }
  if (
    body.purchase_price === null ||
    typeof body.purchase_price === "number"
  ) {
    update.purchase_price = body.purchase_price as number | null;
  }
  if (body.purchase_date === null || typeof body.purchase_date === "string") {
    update.purchase_date = body.purchase_date as string | null;
  }
  if (typeof body.is_favorite === "boolean") {
    update.is_favorite = body.is_favorite;
  }
  if (typeof body.exclude_from_recommendations === "boolean") {
    update.exclude_from_recommendations = body.exclude_from_recommendations;
  }

  update.ai_confidence = null;
  return update;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createRouteClient(request);
    const userId = await getRouteUserId(supabase);
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const draft = await fetchDraftForUser(supabase, userId, id);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Get clothing draft error:", error);
    return NextResponse.json(
      { error: "Failed to load draft" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createRouteClient(request);
    const userId = await getRouteUserId(supabase);
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const update = pickDraftUpdate(buildPatchUpdate(body));

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const { data: existing } = await supabase
      .from("clothing_items")
      .select("status, notes")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!existing || !isDraftItem(existing)) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("clothing_items")
      .update(update)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const draft = await fetchDraftForUser(supabase, userId, id);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Update clothing draft error:", error);
    return NextResponse.json(
      { error: "Failed to update draft" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createRouteClient(request);
    const userId = await getRouteUserId(supabase);
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: draft } = await supabase
      .from("clothing_items")
      .select("image_url, status, notes")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!draft || !isDraftItem(draft)) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    await supabase.storage.from("wardrobe-images").remove([draft.image_url]);

    const { error } = await supabase
      .from("clothing_items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete clothing draft error:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 },
    );
  }
}
