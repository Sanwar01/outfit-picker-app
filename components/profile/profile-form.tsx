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
import type { Profile } from "@/lib/types/database";
import type { StyleVibe } from "@/lib/types/clothing";

interface ProfileFormProps {
  profile: Profile;
  email: string;
  wardrobeCount: number;
}

export function ProfileForm({
  profile,
  email,
  wardrobeCount,
}: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [vibes, setVibes] = useState<StyleVibe[]>(
    (profile.style_vibes ?? []) as StyleVibe[]
  );
  const [saving, setSaving] = useState(false);

  async function saveVibes() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ style_vibes: vibes })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save style preferences");
      return;
    }
    toast.success("Style preferences saved");
    router.refresh();
  }

  async function saveLocation(lat: number, lng: number, city: string | null) {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        location_lat: lat,
        location_lng: lng,
        location_city: city,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save location");
      return;
    }
    toast.success("Location saved");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
          <CardDescription>Your profile overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-stone-500">Email:</span> {email}
          </p>
          <p>
            <span className="text-stone-500">Wardrobe:</span> {wardrobeCount}{" "}
            items
          </p>
          {profile.location_city && (
            <p>
              <span className="text-stone-500">Location:</span>{" "}
              {profile.location_city}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Style vibes</CardTitle>
          <CardDescription>Up to 3 preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <StyleChips selected={vibes} onChange={setVibes} />
          <Button
            onClick={saveVibes}
            disabled={saving}
            className="rounded-xl"
          >
            Save preferences
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Location</CardTitle>
          <CardDescription>Used for weather suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <LocationStep
            onLocation={saveLocation}
            onSkip={() => toast.message("Location unchanged")}
          />
        </CardContent>
      </Card>

      <form action="/auth/signout" method="post">
        <Button type="submit" variant="outline" className="w-full rounded-xl">
          Sign out
        </Button>
      </form>
    </div>
  );
}
