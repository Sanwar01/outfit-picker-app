import {
  AuthBrand,
  AuthFeatureGrid,
  AuthHeroBackground,
} from "@/components/auth/auth-brand";

export function LoginHero() {
  return (
    <section className="relative overflow-hidden px-6 pb-10 pt-12">
      <AuthHeroBackground />

      <div className="relative mx-auto max-w-md">
        <AuthBrand />

        <h1 className="mt-8 font-(family-name:--font-auth-serif) text-[2rem] leading-[1.15] tracking-tight text-[#1a1a1a]">
          Your wardrobe,
          <br />
          smarter every day.
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#6b6560]">
          Get personalized outfit ideas from what you already own.
        </p>

        <AuthFeatureGrid />
      </div>
    </section>
  );
}
