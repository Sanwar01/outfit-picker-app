'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { requestPasswordReset } from '@/app/(auth)/login/actions';
import { useRememberedEmail } from '@/lib/auth/use-remembered-email';
import { AuthBrand } from '@/components/auth/auth-brand';
import { AuthField } from '@/components/auth/auth-field';

interface ForgotPasswordFormProps {
  error?: string;
  sent?: boolean;
}

function SecurityNotice() {
  return (
    <div className="mt-8 flex gap-3 rounded-2xl bg-[#ebe4d8]/80 p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cream">
        <Lock className="size-4 text-brand" strokeWidth={1.5} />
      </div>
      <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
        <p className="font-semibold text-foreground">Your security matters</p>
        <p>We&apos;ll never share your email with anyone.</p>
        <p>Check your spam folder if you don&apos;t see the email.</p>
      </div>
    </div>
  );
}

function ForgotPasswordShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-dvh flex-col px-6 pb-10 pt-6">
      <Link
        href="/login"
        className="mb-8 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm transition-colors hover:bg-white"
        aria-label="Back to log in"
      >
        <ArrowLeft className="size-5" strokeWidth={1.5} />
      </Link>

      <div className="mx-auto w-full max-w-md">
        <AuthBrand variant="centered" />

        <div className="relative mx-auto mt-8 h-40 w-full max-w-[220px]">
          <Image
            src="/auth/forgot-password-hero.png"
            alt=""
            fill
            priority
            className="object-contain object-center"
            sizes="220px"
          />
        </div>

        {children}
      </div>
    </section>
  );
}

export function ForgotPasswordForm({ error, sent }: ForgotPasswordFormProps) {
  const rememberedEmail = useRememberedEmail();
  const [emailOverride, setEmailOverride] = useState<string | null>(null);
  const email = emailOverride ?? rememberedEmail;

  if (sent) {
    return (
      <ForgotPasswordShell>
        <h1 className="mt-8 text-center font-serif text-[1.75rem] leading-tight tracking-tight text-foreground">
          Check your email
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-relaxed text-muted-foreground">
          If an account exists for that address, we sent a link to reset your
          password.
        </p>

        <Link
          href="/login"
          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Back to log in
        </Link>

        <SecurityNotice />
      </ForgotPasswordShell>
    );
  }

  return (
    <ForgotPasswordShell>
      <h1 className="mt-8 text-center font-serif text-[1.75rem] leading-tight tracking-tight text-foreground">
        Forgot your password?
      </h1>
      <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-relaxed text-muted-foreground">
        No worries! Enter your email address and we&apos;ll send you a link to
        reset your password.
      </p>

      {error && (
        <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <form
        action={requestPasswordReset}
        className={`space-y-5 ${error ? 'mt-4' : 'mt-8'}`}
      >
        <AuthField
          name="email"
          type="email"
          label="Email address"
          placeholder="Enter your email address"
          autoComplete="email"
          required
          value={email}
          onChange={setEmailOverride}
        />
        <button
          type="submit"
          className="h-12 w-full rounded-2xl bg-primary text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Send reset link
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#8b8178]">
        Remember your password?{' '}
        <Link
          href="/login"
          className="font-serif text-brand hover:underline"
        >
          Log in
        </Link>
      </p>

      <SecurityNotice />
    </ForgotPasswordShell>
  );
}
