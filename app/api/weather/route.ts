import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveWeather } from "@/lib/outfits/generate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();

    if (!claimsData?.claims?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", claimsData.claims.sub as string)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const weather = await resolveWeather(profile);
    return NextResponse.json(weather);
  } catch (error) {
    console.error("Weather error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Weather fetch failed" },
      { status: 500 }
    );
  }
}
