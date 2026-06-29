import { ONBOARDING_STEPS } from "@/lib/onboarding/constants";
import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  currentStep: number;
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {Array.from({ length: ONBOARDING_STEPS }, (_, index) => {
        const step = index + 1;
        const isComplete = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                "size-2.5 rounded-full transition-colors",
                isComplete || isCurrent ? "bg-brand" : "bg-[#e0d8ce]"
              )}
            />
            {step < ONBOARDING_STEPS && (
              <div
                className={cn(
                  "h-px w-8 transition-colors sm:w-10",
                  step < currentStep ? "bg-brand" : "bg-[#e0d8ce]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
