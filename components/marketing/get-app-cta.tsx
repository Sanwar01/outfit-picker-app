"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { requestInstall, type RequestInstallState } from "@/lib/marketing/request-install";
import type { AppLinks, AppPlatform } from "@/lib/marketing/app-links";

const INITIAL: RequestInstallState = { ok: false };

const PLATFORM_OPTIONS: { value: AppPlatform; label: string }[] = [
  { value: "ios", label: "iPhone" },
  { value: "android", label: "Android" },
  { value: "both", label: "Both" },
];

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
      <path d="M16.7 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9s-1.9-1-3.1-.9c-1.6.1-3.1 1-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.7 2.5 3 2.4 1.2-.1 1.6-.7 3.1-.7s1.8.7 3.1.7c1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.6-3.8zM14.6 5.3c.6-.8 1.1-1.9.9-3-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 2.9 1.1.1 2.2-.5 3-1.4z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
      <path d="M4.5 3.6v16.8c0 .7.8 1.1 1.4.7l13.2-8.4c.6-.4.6-1.3 0-1.7L5.9 2.9c-.6-.4-1.4 0-1.4.7z" />
    </svg>
  );
}

function StoreButton({
  href,
  label,
  sublabel,
  icon,
}: {
  href: string;
  label: string;
  sublabel: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex min-h-14 flex-1 items-center gap-3 rounded-2xl bg-ink px-5 py-3 text-white transition-colors hover:bg-ink/90"
    >
      {icon}
      <span className="text-left">
        <span className="block text-[10px] font-medium tracking-wide text-white/70">
          {sublabel}
        </span>
        <span className="block text-sm font-semibold leading-tight">{label}</span>
      </span>
    </a>
  );
}

export function GetAppCta({ ios, android }: AppLinks) {
  const [state, action, pending] = useActionState(requestInstall, INITIAL);
  const showIosButton = Boolean(ios);
  const showAndroidButton = Boolean(android);
  const missingIos = !showIosButton;
  const missingAndroid = !showAndroidButton;
  const showForm = missingIos || missingAndroid;
  const platformOptions = PLATFORM_OPTIONS.filter((option) => {
    if (option.value === "ios") return missingIos;
    if (option.value === "android") return missingAndroid;
    return missingIos && missingAndroid;
  });
  const defaultPlatform = platformOptions[0]?.value ?? "both";

  return (
    <div className="space-y-5">
      {(showIosButton || showAndroidButton) && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {ios ? (
            <StoreButton
              href={ios}
              sublabel="Get it on"
              label="iPhone"
              icon={<AppleIcon />}
            />
          ) : null}
          {android ? (
            <StoreButton
              href={android}
              sublabel="Get it on"
              label="Android"
              icon={<PlayIcon />}
            />
          ) : null}
        </div>
      )}

      {showForm && !state.ok ? (
        <form action={action} className="space-y-4">
          {showIosButton || showAndroidButton ? (
            <p className="text-sm text-muted-foreground">
              {missingIos
                ? "Leave your email and we’ll send a link for iPhone."
                : "Leave your email and we’ll send a link for Android."}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter your email and we’ll send a link to install Wardrobe on your
              phone.
            </p>
          )}

          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              className="h-12 w-full rounded-2xl border border-input bg-white px-4 text-sm text-foreground outline-none placeholder:text-ink-faint focus-visible:border-border-strong focus-visible:ring-2 focus-visible:ring-[#c9bfb0]/30"
            />
          </div>

          {platformOptions.length > 1 ? (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-foreground">
                I have
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {platformOptions.map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="platform"
                      value={option.value}
                      defaultChecked={option.value === defaultPlatform}
                      className="peer sr-only"
                    />
                    <span className="flex h-11 items-center justify-center rounded-2xl border border-border bg-white text-sm peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <input type="hidden" name="platform" value={defaultPlatform} />
          )}

          {state.error ? (
            <p className="text-sm text-red-700">{state.error}</p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-2xl bg-primary text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {pending ? "Sending…" : "Get the app"}
          </button>
        </form>
      ) : null}

      {state.ok ? (
        <p className="rounded-2xl bg-cream px-4 py-3 text-sm leading-relaxed text-foreground">
          You’re on the list. We’ll email you a link to install Wardrobe.
        </p>
      ) : null}
    </div>
  );
}
