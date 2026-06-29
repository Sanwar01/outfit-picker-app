"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

interface LocationStepProps {
  userId: string;
}

export function OnboardingLocationStep({ userId }: LocationStepProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    city: string | null;
  } | null>(null);

  async function handleUseLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported on this device.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let city: string | null = null;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          city =
            data.address?.city ??
            data.address?.town ??
            data.address?.village ??
            null;
        } catch {
          // City is optional
        }

        setLocation({ lat, lng, city });
        setLoading(false);
      },
      () => {
        setError("Unable to get your location. You can skip this step.");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  async function handleContinue() {
    setSaving(true);

    const update = location
      ? {
          location_lat: location.lat,
          location_lng: location.lng,
          location_city: location.city,
        }
      : {};

    const { error: saveError } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", userId);

    if (saveError) {
      toast.error("Failed to save location");
      setSaving(false);
      return;
    }

    router.push("/onboarding/finish");
    router.refresh();
  }

  return (
    <OnboardingShell
      step={3}
      title="Where are you based?"
      subtitle="We use your location for weather-based outfit suggestions."
      backHref="/onboarding/wardrobe"
      footer={
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleContinue}
            disabled={saving}
            className="h-12 w-full rounded-2xl bg-primary text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Continue"}
          </button>
          <button
            type="button"
            onClick={() => {
              setLocation(null);
              void handleContinue();
            }}
            disabled={saving}
            className="h-11 w-full text-sm font-medium text-brand hover:underline disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      }
    >
      <div className="rounded-2xl border border-border bg-white p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Enable location so we can factor in today&apos;s weather when picking
          outfits from your closet.
        </p>

        {error && (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </p>
        )}

        {location?.city && (
          <p className="mt-4 text-sm font-medium text-foreground">
            Location set: {location.city}
          </p>
        )}

        <button
          type="button"
          onClick={handleUseLocation}
          disabled={loading}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MapPin className="size-4" strokeWidth={1.5} />
          )}
          Use my location
        </button>
      </div>
    </OnboardingShell>
  );
}
