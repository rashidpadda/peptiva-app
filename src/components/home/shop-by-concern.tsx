import Link from "next/link";
import { concerns } from "@/data/categories";

export function ShopByConcern() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">Personalize Your Routine</p>
        <h2 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">Shop by Concern</h2>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {concerns.map((concern) => (
          <Link
            key={concern.name}
            href={`/shop?concern=${encodeURIComponent(concern.name)}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border-soft bg-cream p-6 text-center transition-colors hover:border-sage"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-beige text-sm font-serif text-sage-dark transition-transform group-hover:scale-105">
              {concern.name.charAt(0)}
            </span>
            <div>
              <p className="text-sm font-medium text-charcoal">{concern.name}</p>
              <p className="mt-1 text-[11px] text-stone-500">{concern.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
