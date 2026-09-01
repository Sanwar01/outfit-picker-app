import Image from 'next/image';
import Link from 'next/link';
import { Camera, CloudSun, Sparkles } from 'lucide-react';
import { AuthBrand } from '@/components/auth/auth-brand';
import { GetAppCta } from '@/components/marketing/get-app-cta';
import { getAppLinks } from '@/lib/marketing/app-links';

const STEPS = [
  {
    icon: Camera,
    title: 'Photograph your clothes',
    body: 'Snap what you already own. We tag each piece so your closet is actually usable.',
  },
  {
    icon: Sparkles,
    title: 'Get a look for today',
    body: 'Outfits from your wardrobe, matched to your style, the weather, and the occasion.',
  },
  {
    icon: CloudSun,
    title: 'Wear it without guessing',
    body: 'Save the ones you like. Log what you wore. Ask for another option anytime.',
  },
] as const;

export function LandingPage() {
  const links = getAppLinks();

  return (
    <div className="min-h-dvh bg-cream text-foreground">
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <AuthBrand />
        <a
          href="#get-the-app"
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90"
        >
          Get the app
        </a>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#efe1d5_0%,transparent_55%)]" />
        <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-6 pb-16 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24 lg:pt-12">
          <div>
            <p className="text-[11px] font-medium tracking-[0.22em] text-brand">
              IPHONE &amp; ANDROID
            </p>
            <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Your style.
              <br />
              <span className="text-brand">Simplified.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              You already have the clothes. Wardrobe picks an outfit for today —
              for the weather and whatever you’re doing.
            </p>
            <div className="mt-8 max-w-md">
              <GetAppCta {...links} />
            </div>
          </div>

          <div className="mx-auto w-full max-w-70 lg:max-w-[320px]">
            <div className="overflow-hidden rounded-[2.4rem] border-10 border-ink bg-ink shadow-[0_24px_60px_rgba(26,26,26,0.18)]">
              <div className="relative aspect-9/19">
                <Image
                  src="/marketing/welcome-hero.jpg"
                  alt="A calm, organized wardrobe"
                  fill
                  priority
                  className="object-cover"
                  sizes="320px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
          How Wardrobe works
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Three steps from a pile of clothes to an outfit you can actually put
          on.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-3xl border border-border bg-white p-5"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-cream">
                <Icon className="size-5 text-brand" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 font-serif text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
          <h2 className="max-w-xl font-serif text-3xl tracking-tight sm:text-4xl">
            Stop standing in the closet guessing.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Wardrobe is for getting dressed, not browsing fashion. It uses what
            you already own and gives you one look for today — then another if
            you want it.
          </p>
        </div>
      </section>

      <section
        id="get-the-app"
        className="mx-auto max-w-5xl px-6 py-14 sm:py-20"
      >
        <div className="rounded-[2rem] border border-border bg-white px-6 py-10 sm:px-10">
          <h2 className="font-serif text-3xl tracking-tight">Get the app</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Available on iPhone and Android. We’ll send you a link to install
            Wardrobe on your phone.
          </p>
          <div className="mt-8 max-w-md">
            <GetAppCta {...links} />
          </div>
          <p className="mt-6 text-xs text-ink-faint">
            We only use your email to send the install link.{' '}
            <Link
              href="/privacy"
              className="underline-offset-2 hover:underline"
            >
              Privacy
            </Link>
          </p>
        </div>
      </section>

      <footer className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-ink-faint">
        <p>Wardrobe · Wear better. Every day.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
