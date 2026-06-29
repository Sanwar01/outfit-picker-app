import Image from "next/image";
import { CloudSun, Shirt, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const AUTH_FEATURE_ITEMS: {
  id: string;
  icon: LucideIcon;
  plainLabel: string;
  label: ReactNode;
}[] = [
  {
    id: "organize",
    icon: Shirt,
    plainLabel: "Organize your clothes",
    label: (
      <>
        <span className="font-semibold text-foreground">Organize</span> your clothes
      </>
    ),
  },
  {
    id: "outfits",
    icon: Sparkles,
    plainLabel: "Get outfits you'll love",
    label: (
      <>
        <span className="font-semibold text-foreground">Get outfits</span> you&apos;ll
        love
      </>
    ),
  },
  {
    id: "weather",
    icon: CloudSun,
    plainLabel: "Daily picks for the weather",
    label: (
      <>
        <span className="font-semibold text-foreground">Daily picks</span> for the
        weather
      </>
    ),
  },
];

interface AuthBrandProps {
  variant?: "inline" | "centered";
}

function HangerLogo() {
  return (
    <div className="flex size-11 items-center justify-center rounded-2xl bg-[#ebe4d8] shadow-sm">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-5 text-foreground"
        aria-hidden
      >
        <path d="M6 4h12l-1.2 3H7.2L6 4Z" />
        <path d="M7 7v2.5c0 2.5 2 4.5 5 4.5s5-2 5-4.5V7" />
        <path d="M5 7h14" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function AuthBrand({ variant = "inline" }: AuthBrandProps) {
  if (variant === "centered") {
    return (
      <div className="flex flex-col items-center text-center">
        <HangerLogo />
        <p className="mt-3 font-serif text-2xl leading-none text-foreground">
          Wardrobe
        </p>
        <p className="mt-1 text-[10px] font-medium tracking-[0.2em] text-brand">
          WEAR BETTER. EVERY DAY.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <HangerLogo />
      <div>
        <p className="font-serif text-2xl leading-none text-foreground">
          Wardrobe
        </p>
        <p className="mt-1 text-[10px] font-medium tracking-[0.2em] text-brand">
          WEAR BETTER. EVERY DAY.
        </p>
      </div>
    </div>
  );
}

interface AuthFeatureGridProps {
  tileClassName?: string;
  variant?: "login" | "signup";
}

export function AuthFeatureGrid({
  tileClassName = "bg-[#ebe4d8]/90",
  variant = "login",
}: AuthFeatureGridProps) {
  return (
    <div className="mt-8 grid grid-cols-3 gap-3">
      {AUTH_FEATURE_ITEMS.map(({ id, icon: Icon, label, plainLabel }) => (
        <div key={id} className="text-center">
          <div
            className={`mx-auto flex size-12 items-center justify-center rounded-2xl ${tileClassName}`}
          >
            <Icon className="size-5 text-[#5c534a]" strokeWidth={1.5} />
          </div>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            {variant === "signup" ? label : plainLabel}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AuthHeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Image
        src="/auth/login-hero.png"
        alt=""
        fill
        priority
        className="object-cover object-top opacity-30"
        sizes="(max-width: 512px) 100vw, 448px"
      />
      <div className="absolute inset-0 bg-linear-to-b from-cream/70 via-cream/85 to-cream" />
    </div>
  );
}
