import { ClipboardList, Shirt, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface OnboardingSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function OnboardingSection({
  icon: Icon,
  title,
  description,
  children,
}: OnboardingSectionProps) {
  return (
    <section className="border-b border-[#ebe4d8] py-6 first:pt-0 last:border-b-0 last:pb-0">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f4efe6]">
          <Icon className="size-4 text-[#8b7355]" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-(family-name:--font-auth-serif) text-2xl text-[#1a1a1a] font-semibold">
            {title}
          </h1>
          <p className="mt-0.5 text-sm leading-relaxed text-[#6b6560]">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

export {
  Shirt as StyleSectionIcon,
  ClipboardList as GoalsSectionIcon,
  UserRound as AudienceSectionIcon,
};
