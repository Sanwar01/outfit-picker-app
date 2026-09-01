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
