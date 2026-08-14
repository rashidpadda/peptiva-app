"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = {
  eyebrow: string;
  title: string;
  body?: string;
  points?: string[];
  icon: React.ReactNode;
};

function MoleculeIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" aria-hidden>
      <circle cx="20" cy="10" r="4.5" fill="currentColor" fillOpacity="0.85" />
      <circle cx="9" cy="27" r="4.5" fill="currentColor" fillOpacity="0.65" />
      <circle cx="31" cy="27" r="4.5" fill="currentColor" fillOpacity="0.75" />
      <path d="M20 14.2 10 23M20 14.2l10 8.8M12.8 27h14.4" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.5" />
    </svg>
  );
}

function ScaffoldIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" aria-hidden>
      <path
        d="M8 32V12l12-6 12 6v20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeOpacity="0.85"
      />
      <path d="M8 20h24M14 12v20M26 12v20" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.45" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" aria-hidden>
      <path
        d="M20 6 32 10v10c0 8-5 13-12 15-7-2-12-7-12-15V10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeOpacity="0.85"
      />
      <path d="M14.5 20.5 18.5 24.5 26 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" aria-hidden>
      <path
        d="M20 6c1 6 3 8 9 9-6 1-8 3-9 9-1-6-3-8-9-9 6-1 8-3 9-9z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      <circle cx="30" cy="28" r="2.2" fill="currentColor" fillOpacity="0.55" />
    </svg>
  );
}

const STEPS: Step[] = [
  {
    eyebrow: "01 — Definition",
    title: "What are peptides?",
    body: "Peptide products are specialized skincare and dietary formulations containing short chains of amino acids.",
    icon: <MoleculeIcon />,
  },
  {
    eyebrow: "02 — How they work",
    title: "Nature's building blocks",
    body: "They act as building blocks for vital proteins like collagen and elastin — the structural proteins that keep skin looking firm and resilient.",
    icon: <ScaffoldIcon />,
  },
  {
    eyebrow: "03 — Benefits",
    title: "What they help with",
    points: [
      "Helps firm the look of skin",
      "Reduces the appearance of fine lines",
      "Supports skin barrier repair",
    ],
    icon: <ShieldIcon />,
  },
  {
    eyebrow: "04 — Next step",
    title: "See it in your routine",
    body: "Explore the formulas built around this science, from lightweight serums to targeted treatments.",
    icon: <SparkleIcon />,
  },
];

export function PeptideScience() {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <section id="peptide-science" className="bg-charcoal py-20 text-ivory scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-champagne">
            Peptide Science
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
            Small molecules. Thoughtful formulas.
          </h2>
        </div>

        <div className="mx-auto mt-12 w-full max-w-md">
          {/* progress */}
          <div className="mb-5 flex items-center justify-center gap-2">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step ? "w-8 bg-champagne" : "w-1.5 bg-ivory/25"
                )}
              />
            ))}
          </div>

          <div className="rounded-3xl bg-ivory p-7 text-charcoal shadow-2xl shadow-black/20 sm:p-8">
            <div key={step} className="animate-fade-up">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-beige text-sage-dark">
                {current.icon}
              </div>

              <p className="mt-5 text-[11px] font-medium uppercase tracking-wider text-stone-500">
                {current.eyebrow}
              </p>
              <h3 className="mt-1.5 font-serif text-2xl text-charcoal">{current.title}</h3>

              {current.body && (
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{current.body}</p>
              )}

              {current.points && (
                <ul className="mt-4 space-y-2.5">
                  {current.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm text-stone-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-7 flex items-center gap-3">
              {step > 0 && (
                <Button variant="secondary" size="md" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              )}
              {isLast ? (
                <Button asChild size="md" className="flex-1">
                  <Link href="/shop">Shop Peptide Formulas</Link>
                </Button>
              ) : (
                <Button size="md" className="flex-1" onClick={() => setStep((s) => s + 1)}>
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
