'use client';

import Link from 'next/link';
import { useState } from 'react';
import { requestPasswordReset } from '@/app/(auth)/login/actions';
import { useRememberedEmail } from '@/lib/auth/use-remembered-email';
import { AuthField } from '@/components/auth/auth-field';

interface ForgotPasswordFormProps {
  error?: string;
  sent?: boolean;
}

export function ForgotPasswordForm({ error, sent }: ForgotPasswordFormProps) {
  const rememberedEmail = useRememberedEmail();
  const [emailOverride, setEmailOverride] = useState<string | null>(null);
  const email = emailOverride ?? rememberedEmail;

  if (sent) {
    return (
      <section className="flex min-h-dvh flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-md rounded-t-[2rem] bg-white px-6 py-10 shadow-sm">
          <h1 className="font-(family-name:--font-auth-serif) text-3xl tracking-tight text-[#1a1a1a]">
            Check your email
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#6b6560]">
            If an account exists for that address, we sent a link to reset your
            password.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333]"
          >
            Back to log in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md rounded-t-[2rem] bg-white px-6 py-10 shadow-sm">
        <h1 className="font-(family-name:--font-auth-serif) text-3xl tracking-tight text-[#1a1a1a]">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-[#8b8178]">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {error && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={requestPasswordReset} className="mt-6 space-y-4">
          <AuthField
            name="email"
            type="email"
            placeholder="Email address"
            autoComplete="email"
            required
            value={email}
            onChange={setEmailOverride}
          />
          <button
            type="submit"
            className="h-12 w-full rounded-2xl bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333]"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8b8178]">
          <Link
            href="/login"
            className="font-(family-name:--font-auth-serif) text-[#8b7355] hover:underline"
          >
            Back to log in
          </Link>
        </p>
      </div>
    </section>
  );
}
