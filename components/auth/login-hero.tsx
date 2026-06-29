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

        <h1 className="mt-8 font-serif text-[2rem] leading-[1.15] tracking-tight text-foreground">
          Your wardrobe,
          <br />
          smarter every day.
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Get personalized outfit ideas from what you already own.
        </p>

        <AuthFeatureGrid />
      </div>
    </section>
  );
}
