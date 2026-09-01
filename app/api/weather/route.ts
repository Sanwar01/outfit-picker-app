import { NextResponse } from "next/server";
import { getRouteUserId } from "@/lib/api/route-auth";
import { createRouteClient } from "@/lib/supabase/route-client";
import { resolveWeatherBundle } from "@/lib/outfits/generate";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createRouteClient(request);
    const userId = await getRouteUserId(supabase);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const bundle = await resolveWeatherBundle(profile);
    return NextResponse.json(bundle);
  } catch (error) {
    console.error("Weather error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Weather fetch failed" },
      { status: 500 }
    );
  }
}
