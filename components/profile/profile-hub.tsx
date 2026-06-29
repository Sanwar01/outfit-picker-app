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
        <h1 className="font-serif text-[1.75rem] leading-tight tracking-tight text-foreground">
          Hi, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s your style journey
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="flex gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground"
            aria-hidden
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl text-foreground">
              {displayName}
            </h2>
            {profile.location_city && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {profile.location_city}
              </p>
            )}
            {tagline && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tagline}
              </p>
            )}
            <p className="mt-1 text-xs text-ink-faint">
              {wardrobeCount} {wardrobeCount === 1 ? "item" : "items"} in your
              wardrobe
            </p>
          </div>
        </div>

        <Link
          href="/profile/edit"
          className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-muted text-sm font-medium text-foreground transition-colors hover:bg-cream-deep"
        >
          Edit profile
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-serif text-lg text-foreground">
            My style preferences
          </h2>
          <Link
            href="/profile/edit"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Edit ›
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-white p-3.5">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Shirt className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <p className="text-xs text-ink-faint">Style vibe</p>
          <p className="mt-1 text-sm font-medium text-foreground">
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
