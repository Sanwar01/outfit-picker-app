import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileForm } from "@/components/profile/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub as string;
  const email = (claimsData.claims.email as string) ?? "";

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const { count } = await supabase
    .from("clothing_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <AppShell>
      <div className="px-4 py-6">
        <h1 className="mb-6 text-xl font-semibold text-stone-900">Profile</h1>
        <ProfileForm
          profile={profile}
          email={email}
          wardrobeCount={count ?? 0}
        />
      </div>
    </AppShell>
  );
}
