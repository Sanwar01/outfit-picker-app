"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { StyleChips } from "@/components/onboarding/style-chips";
import { LocationStep } from "@/components/onboarding/location-step";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StyleVibe } from "@/lib/types/clothing";

export function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [vibes, setVibes] = useState<StyleVibe[]>([]);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    city: string | null;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  async function finish() {
    setSaving(true);

    const update: {
      style_vibes: StyleVibe[];
      onboarding_complete: boolean;
      location_lat?: number;
      location_lng?: number;
      location_city?: string | null;
    } = {
      style_vibes: vibes,
      onboarding_complete: true,
    };

    if (location) {
      update.location_lat = location.lat;
      update.location_lng = location.lng;
      update.location_city = location.city;
    }

    const { error } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", userId);

    if (error) {
      toast.error("Failed to save preferences");
      setSaving(false);
      return;
    }

    const { count } = await supabase
      .from("clothing_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    router.push(count && count > 0 ? "/wardrobe" : "/wardrobe/add");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-stone-400">
          Step {step} of 2
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-900">
          {step === 1 ? "What's your style?" : "Where are you based?"}
        </h1>
      </div>

      <Card className="rounded-2xl border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            {step === 1 ? "Pick up to 3 vibes" : "Enable location"}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? "Optional — helps personalize outfit suggestions later."
              : "Optional — used for weather-based recommendations."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 ? (
            <>
              <StyleChips selected={vibes} onChange={setVibes} />
              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => setStep(2)}
                >
                  Skip
                </Button>
                <Button
                  className="flex-1 rounded-xl"
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              <LocationStep
                onLocation={(lat, lng, city) =>
                  setLocation({ lat, lng, city })
                }
                onSkip={() => setLocation(null)}
              />
              <Button
                className="w-full rounded-xl"
                onClick={finish}
                disabled={saving}
              >
                {saving ? "Saving..." : "Get started"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
