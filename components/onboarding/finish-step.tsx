"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

interface FinishStepProps {
  userId: string;
}

export function FinishStep({ userId }: FinishStepProps) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  async function handleGetStarted() {
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_complete: true })
      .eq("id", userId);

    if (error) {
      toast.error("Something went wrong");
      setSaving(false);
      return;
    }

    const { count } = await supabase
      .from("clothing_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active");

    router.push(count && count > 0 ? "/today" : "/wardrobe/add");
    router.refresh();
  }

  return (
    <OnboardingShell
      step={4}
      title="You're all set"
      subtitle="Your wardrobe is ready. Let's find something great to wear today."
      backHref="/onboarding/location"
      footer={
        <button
          type="button"
          onClick={handleGetStarted}
          disabled={saving}
          className="h-12 w-full rounded-2xl bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-50"
        >
          {saving ? "Starting..." : "Get started"}
        </button>
      }
    >
      <div className="flex flex-col items-center rounded-2xl bg-[#f4efe6] px-6 py-10 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm">
          <Sparkles className="size-7 text-[#8b7355]" strokeWidth={1.5} />
        </div>
        <p className="mt-6 font-(family-name:--font-auth-serif) text-xl text-[#1a1a1a]">
          Ready when you are
        </p>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#6b6560]">
          We&apos;ll use your style preferences and wardrobe to suggest outfits
          you&apos;ll actually want to wear.
        </p>
      </div>
    </OnboardingShell>
  );
}
