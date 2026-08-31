"use client";

// Shared top-left back affordance, matching the style already established
// in the old demo widget's shell (src/components/quick-buy/widget-shell.tsx).
export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-5 flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-charcoal"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}
