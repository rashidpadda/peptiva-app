import type { ReactNode } from "react";
import Link from "next/link";

const STEP_LABELS = ["Products", "Bag", "Shipping", "Identity", "Payment"];

export function QuickBuyShell({
  step,
  total,
  onBack,
  children,
}: {
  step: number;
  total: number;
  onBack?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:py-20">
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="font-serif text-lg tracking-wide text-charcoal/70 transition-colors hover:text-charcoal"
        >
          PEPTIVA
        </Link>
        <p className="mt-3 text-xs font-medium uppercase tracking-wider text-sage-dark">Quick Buy</p>
        <h1 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">
          Build your peptide routine
        </h1>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium uppercase tracking-wider text-stone-500">
            Step {step} of {total}
          </span>
          <span className="font-medium uppercase tracking-wider text-sage-dark">
            {STEP_LABELS[step - 1]}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-beige">
          <div
            className="h-full rounded-full bg-sage transition-all duration-500 ease-out"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-border-soft bg-cream p-6 shadow-xl shadow-charcoal/5 sm:p-8">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-5 flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-charcoal"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        <div key={step} className="animate-fade-up">
          {children}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-stone-400">
        This is a demo checkout — no real payment is processed.
      </p>
    </div>
  );
}
