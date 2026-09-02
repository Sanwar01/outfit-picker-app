import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRouteUserId } from "@/lib/api/route-auth";
import {
  isQuotaExceededError,
  quotaExceededResponse,
} from "@/lib/billing/errors";
import { assertWardrobeCapacity } from "@/lib/billing/usage";
import { isValidUuid } from "@/lib/ids/uuid";
import { createRouteClient } from "@/lib/supabase/route-client";
import {
  confirmDraftsForUser,
  fetchAllDraftsForUser,
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

    const body = await request.json().catch(() => ({}));
    const rawIds = body.itemIds as string[] | undefined;
    const itemIds =
      rawIds?.filter((id): id is string => typeof id === "string" && isValidUuid(id)) ??
      [];

    let idsToConfirm = itemIds;

    if (idsToConfirm.length === 0) {
      const drafts = await fetchAllDraftsForUser(supabase, userId);
      idsToConfirm = drafts.map((draft) => draft.id);
    }

    if (idsToConfirm.length === 0) {
      return NextResponse.json({ error: "No drafts to confirm" }, { status: 400 });
    }

    try {
      await assertWardrobeCapacity(supabase, userId, idsToConfirm.length);
    } catch (error) {
      if (isQuotaExceededError(error)) {
        return quotaExceededResponse(error);
      }
      throw error;
    }

    const confirmed = await confirmDraftsForUser(
      supabase,
      userId,
      idsToConfirm,
    );

    return NextResponse.json({
      confirmed: confirmed as ClothingItem[],
      count: confirmed.length,
    });
  } catch (error) {
    if (isQuotaExceededError(error)) {
      return quotaExceededResponse(error);
    }
    console.error("Confirm all clothing drafts error:", error);
    return NextResponse.json(
      { error: "Failed to confirm drafts" },
      { status: 500 },
    );
  }
}
