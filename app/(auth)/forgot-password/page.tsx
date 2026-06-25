import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto w-full max-w-lg">
      <ForgotPasswordForm
        error={params.error ? decodeURIComponent(params.error) : undefined}
        sent={params.sent === "1"}
      />
    </main>
  );
}
