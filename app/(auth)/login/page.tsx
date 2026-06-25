import { LoginForm } from "@/components/auth/login-form";
import { LoginHero } from "@/components/auth/login-hero";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : undefined;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg">
      <LoginHero />
      <LoginForm error={error} />
    </main>
  );
}
