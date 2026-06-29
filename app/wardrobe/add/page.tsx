import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UploadQueue } from "@/components/upload/upload-queue";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default async function AddClothingPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/login");
  }

  return (
    <AppShell>
      <div className="px-4 py-6">
        <h1 className="text-xl font-semibold text-foreground">Add clothes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Snap or upload photos — AI will tag each item for you.
        </p>
        <div className="mt-6">
          <UploadQueue userId={claimsData.claims.sub as string} />
        </div>
      </div>
    </AppShell>
  );
}
