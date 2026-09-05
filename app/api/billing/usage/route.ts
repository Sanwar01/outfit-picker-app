import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRouteUserId } from "@/lib/api/route-auth";
import { getUsageSnapshot } from "@/lib/billing/snapshot";
import { createRouteClient } from "@/lib/supabase/route-client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteClient(request);
    const userId = await getRouteUserId(supabase);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await getUsageSnapshot(supabase, userId);
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("Billing usage error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load usage",
      },
      { status: 500 },
    );
  }
}
