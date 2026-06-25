'use client';

import Link from 'next/link';
import { useState } from 'react';
import { loginWithPassword } from '@/app/(auth)/login/actions';
import {
  useRememberedEmail,
  writeRememberedEmail,
} from '@/lib/auth/use-remembered-email';
import { AuthField } from '@/components/auth/auth-field';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';

interface LoginFormProps {
  error?: string;
}

export function LoginForm({ error }: LoginFormProps) {
  const rememberedEmail = useRememberedEmail();
  const [emailOverride, setEmailOverride] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const email = emailOverride ?? rememberedEmail;

  async function handleLogin(formData: FormData) {
    const submittedEmail = String(formData.get('email') ?? '');
    const remember = formData.get('remember') === 'on';

    writeRememberedEmail(remember && submittedEmail ? submittedEmail : null);

    await loginWithPassword(formData);
  }

  return (
    <section className="relative z-10 -mt-6 rounded-t-[2rem] bg-white px-6 pt-8 pb-10 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
      <div className="mx-auto max-w-md">
        <h2 className="font-(family-name:--font-auth-serif) text-3xl tracking-tight text-[#1a1a1a]">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-[#8b8178]">Log in to continue</p>

        <div className="mt-6">
          <SocialAuthButtons />
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#ebe4d8]" />
          </div>
          <p className="relative mx-auto w-fit bg-white px-3 text-xs text-[#a39e97]">
            or continue with email
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={handleLogin} className="space-y-4">
          <AuthField
            name="email"
            type="email"
            placeholder="Email address"
            autoComplete="email"
            required
            value={email}
            onChange={setEmailOverride}
          />
          <AuthField
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            required
          />

          <div className="flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#6b6560]">
              <input
                type="checkbox"
                name="remember"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="size-4 rounded border-[#c9bfb0] accent-[#1a1a1a]"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="font-(family-name:--font-auth-serif) text-sm text-[#8b7355] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="h-12 w-full rounded-2xl bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333]"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8b8178]">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-(family-name:--font-auth-serif) text-[#8b7355] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}
