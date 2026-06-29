"use client";

import Link from "next/link";
import { updatePassword } from "@/app/(auth)/login/actions";
import { AuthField } from "@/components/auth/auth-field";

interface ResetPasswordFormProps {
  error?: string;
}

export function ResetPasswordForm({ error }: ResetPasswordFormProps) {
  return (
    <section className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md rounded-t-[2rem] bg-white px-6 py-10 shadow-sm">
        <h1 className="font-serif text-3xl tracking-tight text-foreground">
          New password
        </h1>
        <p className="mt-2 text-sm text-[#8b8178]">
          Choose a new password for your account.
        </p>

        {error && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={updatePassword} className="mt-6 space-y-4">
          <AuthField
            name="password"
            type="password"
            placeholder="New password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <AuthField
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <button
            type="submit"
            className="h-12 w-full rounded-2xl bg-primary text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Update password
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8b8178]">
          <Link
            href="/login"
            className="font-serif text-brand hover:underline"
          >
            Back to log in
          </Link>
        </p>
      </div>
    </section>
  );
}
