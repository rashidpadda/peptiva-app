import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Information", "Shipping", "Payment", "Review"];

export function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex items-center justify-between gap-2">
      {STEPS.map((step, i) => {
        const index = i + 1;
        const isComplete = index < currentStep;
        const isActive = index === currentStep;
        return (
          <li key={step} className="flex flex-1 items-center gap-2 last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  isComplete && "bg-sage text-white",
                  isActive && "bg-charcoal text-ivory",
                  !isComplete && !isActive && "bg-stone-200 text-stone-500"
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : index}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  isActive || isComplete ? "text-charcoal" : "text-stone-400"
                )}
              >
                {step}
              </span>
            </div>
            {index !== STEPS.length && (
              <span
                className={cn(
                  "h-px flex-1",
                  isComplete ? "bg-sage" : "bg-stone-200"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
