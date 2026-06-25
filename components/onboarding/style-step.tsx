"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { AudienceSelect } from "@/components/onboarding/audience-select";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import {
  AudienceSectionIcon,
  GoalsSectionIcon,
  OnboardingSection,
  StyleSectionIcon,
} from "@/components/onboarding/onboarding-section";
import { StyleGoalsChips } from "@/components/onboarding/style-goals-chips";
import { StyleVibeGrid } from "@/components/onboarding/style-vibe-grid";
import type { OnboardingAudience, StyleGoalId } from "@/lib/onboarding/constants";
import type { StyleVibe } from "@/lib/types/clothing";

interface StyleStepProps {
  userId: string;
  initialVibes: StyleVibe[];
  initialGoals: StyleGoalId[];
  initialAudience: OnboardingAudience | null;
}

export function StyleStep({
  userId,
  initialVibes,
  initialGoals,
  initialAudience,
}: StyleStepProps) {
  const router = useRouter();
  const supabase = createClient();
  const [vibes, setVibes] = useState<StyleVibe[]>(initialVibes);
  const [goals, setGoals] = useState<StyleGoalId[]>(initialGoals);
  const [audience, setAudience] = useState<OnboardingAudience | null>(
    initialAudience ?? "self"
  );
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        style_vibes: vibes,
        style_goals: goals,
        onboarding_audience: audience,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to save your preferences");
      setSaving(false);
      return;
    }

    router.push("/onboarding/wardrobe");
    router.refresh();
  }

  return (
    <OnboardingShell
      step={1}
      title="Let's set up your style"
      subtitle="Tell us a bit about you so we can create outfits you'll love."
      footer={
        <button
          type="button"
          onClick={handleContinue}
          disabled={saving}
          className="h-12 w-full rounded-2xl bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Continue"}
        </button>
      }
    >
      <OnboardingSection
        icon={StyleSectionIcon}
        title="1. What's your style vibe?"
        description="Choose up to 3 that best match you."
      >
        <StyleVibeGrid selected={vibes} onChange={setVibes} />
      </OnboardingSection>

      <OnboardingSection
        icon={GoalsSectionIcon}
        title="2. What are your style goals?"
        description="Choose all that apply."
      >
        <StyleGoalsChips selected={goals} onChange={setGoals} />
      </OnboardingSection>

      <OnboardingSection
        icon={AudienceSectionIcon}
        title="3. Who is this for?"
        description="This helps us personalize your experience."
      >
        <AudienceSelect
          selected={audience}
          onChange={setAudience}
        />
      </OnboardingSection>
    </OnboardingShell>
  );
}
