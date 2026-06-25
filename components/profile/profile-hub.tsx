"use client";

import Link from "next/link";
import {
  Heart,
  MapPin,
  Shirt,
} from "lucide-react";
import { ProfileMenuRow } from "@/components/profile/profile-menu-row";
import {
  formatStyleVibesLabel,
  getProfileInitials,
  profileTagline,
} from "@/lib/profile/display";
import type { Profile } from "@/lib/types/database";
import type { StyleVibe } from "@/lib/types/clothing";

interface ProfileHubProps {
  profile: Profile;
  email: string;
  wardrobeCount: number;
}

export function ProfileHub({
  profile,
  email,
  wardrobeCount,
}: ProfileHubProps) {
  const vibes = (profile.style_vibes ?? []) as StyleVibe[];
  const displayName = profile.display_name?.trim() || email.split("@")[0] || "there";
  const firstName = displayName.split(/\s+/)[0] ?? displayName;
  const initials = getProfileInitials(profile.display_name, email);
  const tagline = profileTagline(vibes);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-(family-name:--font-auth-serif) text-[1.75rem] leading-tight tracking-tight text-neutral-950">
          Hi, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Here&apos;s your style journey
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg font-semibold text-neutral-700"
            aria-hidden
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-(family-name:--font-auth-serif) text-xl text-neutral-950">
              {displayName}
            </h2>
            {profile.location_city && (
              <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {profile.location_city}
              </p>
            )}
            {tagline && (
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {tagline}
              </p>
            )}
            <p className="mt-1 text-xs text-neutral-400">
              {wardrobeCount} {wardrobeCount === 1 ? "item" : "items"} in your
              wardrobe
            </p>
          </div>
        </div>

        <Link
          href="/profile/edit"
          className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-neutral-100 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-200"
        >
          Edit profile
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-(family-name:--font-auth-serif) text-lg text-neutral-950">
            My style preferences
          </h2>
          <Link
            href="/profile/edit"
            className="text-sm font-medium text-neutral-500 hover:text-neutral-800"
          >
            Edit ›
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-3.5">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            <Shirt className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <p className="text-xs text-neutral-400">Style vibe</p>
          <p className="mt-1 text-sm font-medium text-neutral-950">
            {formatStyleVibesLabel(vibes)}
          </p>
        </div>
      </section>

      <nav aria-label="Profile shortcuts">
        <ProfileMenuRow
          icon={Heart}
          title="Liked outfits"
          description="Your favourite outfit combinations"
          href="/outfits?tab=favorites"
        />
      </nav>
    </div>
  );
}
