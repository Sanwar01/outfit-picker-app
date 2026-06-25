import { SignupForm } from "@/components/auth/signup-form";
import { SignupHero } from "@/components/auth/signup-hero";

export const dynamic = "force-dynamic";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : undefined;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg">
      <SignupHero />
      <SignupForm error={error} />
    </main>
  );
}
