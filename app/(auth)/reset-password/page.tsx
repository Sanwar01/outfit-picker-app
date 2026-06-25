import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto w-full max-w-lg">
      <ResetPasswordForm
        error={params.error ? decodeURIComponent(params.error) : undefined}
      />
    </main>
  );
}
