import Link from "next/link";
import { Button } from "@/components/ui/button";

export function IngredientSpotlight() {
  return (
    <section className="bg-beige py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-3xl border border-white/60 bg-gradient-to-br from-cream to-champagne/20">
          <svg viewBox="0 0 200 200" className="h-2/3 w-2/3" aria-hidden>
            <circle cx="100" cy="100" r="70" fill="none" stroke="#7C8A6E" strokeWidth="1.5" strokeDasharray="4 6" />
            <circle cx="100" cy="60" r="10" fill="#7C8A6E" fillOpacity="0.7" />
            <circle cx="135" cy="115" r="10" fill="#D9C39F" fillOpacity="0.85" />
            <circle cx="65" cy="115" r="10" fill="#B78D76" fillOpacity="0.75" />
            <line x1="100" y1="60" x2="135" y2="115" stroke="#3a352f" strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="100" y1="60" x2="65" y2="115" stroke="#3a352f" strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="135" y1="115" x2="65" y2="115" stroke="#3a352f" strokeWidth="1.5" strokeOpacity="0.4" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">
            Ingredient Spotlight
          </p>
          <h2 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">
            Multi-Peptide Complex
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-600">
            The formulation at the heart of our best-selling products. A blend of signal and
            carrier peptides selected to work together, designed to support the appearance of
            firmer, smoother, more resilient-looking skin without a heavy or greasy feel.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-stone-700">
            <li>— Formulated at meaningful, tested concentrations</li>
            <li>— Paired with hyaluronic acid for lightweight hydration</li>
            <li>— Suitable for daily AM/PM use</li>
          </ul>
          <Button asChild className="mt-6">
            <Link href="/shop">Shop Peptide Formulas</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
