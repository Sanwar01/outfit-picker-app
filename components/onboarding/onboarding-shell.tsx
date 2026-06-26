import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';

interface OnboardingShellProps {
  step: number;
  title: string;
  subtitle: string;
  backHref?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function OnboardingShell({
  step,
  title,
  subtitle,
  backHref,
  children,
  footer,
}: OnboardingShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-6 pb-8 pt-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[#1a1a1a] shadow-sm transition-colors hover:bg-[#f4efe6]"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" strokeWidth={1.5} />
          </Link>
        ) : (
          <div className="size-10 shrink-0" />
        )}
        <OnboardingProgress currentStep={step} />
        <div className="size-10 shrink-0" />
      </div>

      <div className="text-center">
        <h1 className="font-(family-name:--font-auth-serif) text-4xl leading-tight tracking-tight text-[#1a1a1a] font-semibold">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-base leading-relaxed text-[#6b6560]">
          {subtitle}
        </p>
      </div>

      <div className="mt-8 flex-1">{children}</div>

      {footer && <div className="mt-8 shrink-0">{footer}</div>}
    </div>
  );
}
