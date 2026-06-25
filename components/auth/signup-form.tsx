'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Shield } from 'lucide-react';
import { signUpWithPassword } from '@/app/(auth)/login/actions';
import { AuthField } from '@/components/auth/auth-field';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';

interface SignupFormProps {
  error?: string;
}

export function SignupForm({ error }: SignupFormProps) {
  const [termsAccepted, setTermsAccepted] = useState(true);

  return (
    <section className="relative z-10 -mt-6 rounded-t-[2rem] bg-white px-6 pt-8 pb-10 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
      <div className="mx-auto max-w-md">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-(family-name:--font-auth-serif) text-3xl tracking-tight text-[#1a1a1a]">
            Sign up
          </h2>
          <p className="text-sm text-[#8b8178]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-(family-name:--font-auth-serif) text-[#8b7355] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <SocialAuthButtons mode="signup" />
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#ebe4d8]" />
          </div>
          <p className="relative mx-auto w-fit bg-white px-3 text-xs text-[#a39e97]">
            or sign up with email
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={signUpWithPassword} className="space-y-4">
          <AuthField
            name="fullName"
            type="text"
            placeholder="Full name"
            autoComplete="name"
            required
            minLength={2}
          />
          <AuthField
            name="email"
            type="email"
            placeholder="Email address"
            autoComplete="email"
            required
          />
          <AuthField
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <AuthField
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            autoComplete="new-password"
            required
            minLength={8}
          />

          <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-snug text-[#6b6560]">
            <input
              type="checkbox"
              name="terms"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-[#c9bfb0] accent-[#1a1a1a]"
            />
            <span>
              I agree to the{' '}
              <Link
                href="/terms"
                className="font-(family-name:--font-auth-serif) text-[#8b7355] hover:underline"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="font-(family-name:--font-auth-serif) text-[#8b7355] hover:underline"
              >
                Privacy Policy
              </Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={!termsAccepted}
            className="h-12 w-full rounded-2xl bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-[#a39e97]">
          <Shield className="size-3.5 shrink-0" strokeWidth={1.5} />
          Your data is secure and private.
        </p>
      </div>
    </section>
  );
}
