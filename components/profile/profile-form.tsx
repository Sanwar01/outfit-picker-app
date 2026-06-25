"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { StyleChips } from "@/components/onboarding/style-chips";
import { LocationStep } from "@/components/onboarding/location-step";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [vibes, setVibes] = useState<StyleVibe[]>(
    (profile.style_vibes ?? []) as StyleVibe[],
  );
  const [saving, setSaving] = useState(false);

  async function saveDisplayName() {
    const trimmed = displayName.trim();
    if (!trimmed) {
      toast.error("Enter your name");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save name");
      return;
    }
    toast.success("Name saved");
    router.refresh();
  }

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
      <header className="flex items-center gap-3">
        <Link
          href="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800"
          aria-label="Back to profile"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-(family-name:--font-auth-serif) text-xl text-neutral-950">
          Edit profile
        </h1>
      </header>

      <Card className="rounded-2xl border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Name</CardTitle>
          <CardDescription>How we greet you in the app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="rounded-xl"
            maxLength={60}
          />
          <Button
            onClick={saveDisplayName}
            disabled={saving}
            className="rounded-xl"
          >
            Save name
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-neutral-200 shadow-sm">
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

      <Card className="rounded-2xl border-neutral-200 shadow-sm">
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

      <Card className="rounded-2xl border-neutral-200 shadow-sm">
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
