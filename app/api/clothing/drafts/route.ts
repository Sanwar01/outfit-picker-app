import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRouteUserId, isUserImagePath } from "@/lib/api/route-auth";
import { resolveItemId } from "@/lib/ids/uuid";
import { createRouteClient } from "@/lib/supabase/route-client";
import {
  buildDraftInsert,
  runDraftTagging,
  toDraftResponse,
  getSignedWardrobeUrl,
} from "@/lib/wardrobe/draft-service";
import type { ClothingItem } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteClient(request);
    const userId = await getRouteUserId(supabase);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const rawItemId = body.itemId as string | undefined;
    const imagePath = body.imagePath as string | undefined;
    const itemId = resolveItemId(rawItemId);

    if (!imagePath) {
      return NextResponse.json(
        { error: "imagePath is required" },
        { status: 400 },
      );
    }

    if (!isUserImagePath(userId, imagePath)) {
      return NextResponse.json(
        { error: "Invalid image path" },
        { status: 400 },
      );
    }

    const { data: draft, error: insertError } = await supabase
      .from("clothing_items")
      .insert(buildDraftInsert({ id: itemId, userId, imagePath }))
      .select()
      .single();

    if (insertError || !draft) {
      console.error("Create clothing draft insert error:", insertError);
      return NextResponse.json(
        { error: insertError?.message ?? "Failed to create draft" },
        { status: 500 },
      );
    }

    const tagged = await runDraftTagging(supabase, userId, itemId);
    const signedImageUrl = await getSignedWardrobeUrl(imagePath);

    if (!signedImageUrl) {
      return NextResponse.json(
        { error: "Failed to create signed URL" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      await toDraftResponse((tagged ?? draft) as ClothingItem, signedImageUrl),
    );
  } catch (error) {
    console.error("Create clothing draft error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create draft",
      },
      { status: 500 },
    );
  }
}
