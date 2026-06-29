"use client";

import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationStepProps {
  onLocation: (lat: number, lng: number, city: string | null) => void;
  onSkip: () => void;
}

export function LocationStep({ onLocation, onSkip }: LocationStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        onLocation(lat, lng, city);
        setLoading(false);
      },
      () => {
        setError("Unable to get your location. You can skip this step.");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        We use your location for weather-based outfit suggestions in Phase 2.
      </p>

      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      )}

      <Button
        type="button"
        onClick={handleUseLocation}
        disabled={loading}
        className="w-full rounded-xl"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="mr-2 h-4 w-4" />
        )}
        Use my location
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={onSkip}
        className="w-full rounded-xl"
      >
        Skip for now
      </Button>
    </div>
  );
}
