import Image from 'next/image';
import { CloudSun, Shirt, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: Shirt,
    label: 'Organize your clothes',
  },
  {
    icon: Sparkles,
    label: "Get outfits you'll love",
  },
  {
    icon: CloudSun,
    label: 'Daily picks for the weather',
  },
] as const;

export function LoginHero() {
  return (
    <section className="relative overflow-hidden px-6 pb-10 pt-12">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/auth/login-hero.png"
          alt=""
          fill
          priority
          className="object-cover object-top opacity-30"
          sizes="(max-width: 512px) 100vw, 448px"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#f4efe6]/70 via-[#f4efe6]/85 to-[#f4efe6]" />
      </div>

      <div className="relative mx-auto max-w-md">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#ebe4d8] shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-5 text-[#1a1a1a]"
              aria-hidden
            >
              <path d="M6 4h12l-1.2 3H7.2L6 4Z" />
              <path d="M7 7v2.5c0 2.5 2 4.5 5 4.5s5-2 5-4.5V7" />
              <path d="M5 7h14" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="font-(family-name:--font-auth-serif) text-2xl leading-none text-[#1a1a1a]">
              Wardrobe
            </p>
            <p className="mt-1 text-[10px] font-medium tracking-[0.2em] text-[#8b7355]">
              WEAR BETTER. EVERY DAY.
            </p>
          </div>
        </div>

        <h1 className="mt-8 font-(family-name:--font-auth-serif) text-[2rem] leading-[1.15] tracking-tight text-[#1a1a1a]">
          Your wardrobe,
          <br />
          smarter every day.
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#6b6560]">
          Get personalized outfit ideas from what you already own.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#ebe4d8]/90">
                <Icon className="size-5 text-[#5c534a]" strokeWidth={1.5} />
              </div>
              <p className="mt-2 text-[11px] leading-snug text-[#6b6560]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
