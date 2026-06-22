import Link from "next/link";
import { signUpWithPassword } from "../login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Outfit Picker
        </h1>
        <p className="mt-2 text-stone-500">Create your digital wardrobe.</p>
      </div>

      <Card className="w-full max-w-sm rounded-2xl border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Choose an email and password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {decodeURIComponent(params.error)}
            </p>
          )}

          <form action={signUpWithPassword} className="space-y-3">
            <Input
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="rounded-xl"
            />
            <Input
              name="password"
              type="password"
              placeholder="Password (min. 8 characters)"
              autoComplete="new-password"
              required
              minLength={8}
              className="rounded-xl"
            />
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              autoComplete="new-password"
              required
              minLength={8}
              className="rounded-xl"
            />
            <Button type="submit" className="w-full rounded-xl">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-stone-900 underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
