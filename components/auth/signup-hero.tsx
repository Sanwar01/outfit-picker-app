import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  AuthBrand,
  AuthFeatureGrid,
  AuthHeroBackground,
} from '@/components/auth/auth-brand';

export function SignupHero() {
  return (
    <section className="relative overflow-hidden px-6 pb-10 pt-6">
      <AuthHeroBackground />

      <div className="relative mx-auto max-w-md">
        <Link
          href="/login"
          className="mb-6 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-[#1a1a1a] shadow-sm transition-colors hover:bg-white"
          aria-label="Back to log in"
        >
          <ArrowLeft className="size-5" strokeWidth={1.5} />
        </Link>

        <AuthBrand />

        <h1 className="mt-8 font-(family-name:--font-auth-serif) text-[2rem] leading-[1.15] tracking-tight text-[#1a1a1a]">
          Create your account
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#6b6560]">
          Start building a smarter wardrobe that works for you.
        </p>

        <AuthFeatureGrid
          tileClassName="bg-white/90 shadow-sm"
          variant="signup"
        />
      </div>
    </section>
  );
}
