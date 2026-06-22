import Link from "next/link";
import { loginWithGoogle, loginWithPassword } from "./actions";
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

export default async function LoginPage({
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
        <p className="mt-2 text-stone-500">Know what to wear in seconds.</p>
      </div>

      <Card className="w-full max-w-sm rounded-2xl border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your email and password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {decodeURIComponent(params.error)}
            </p>
          )}

          <form action={loginWithPassword} className="space-y-3">
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
              placeholder="Password"
              autoComplete="current-password"
              required
              className="rounded-xl"
            />
            <Button type="submit" className="w-full rounded-xl">
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500">
            No account?{" "}
            <Link href="/signup" className="font-medium text-stone-900 underline">
              Sign up
            </Link>
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <form action={loginWithGoogle}>
            <Button type="submit" variant="outline" className="w-full rounded-xl">
              Continue with Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
