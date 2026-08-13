import Link from "next/link";
import { getProductById } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import { ProductVisual } from "@/components/product/product-visual";

const STEPS = [
  { step: "01", title: "Cleanse", body: "Start with a gentle cleanse to prep skin for actives.", productId: "3" },
  { step: "02", title: "Treat", body: "Apply a concentrated peptide treatment to targeted concerns.", productId: "8" },
  { step: "03", title: "Hydrate", body: "Seal in moisture with a peptide-infused cream.", productId: "2" },
  { step: "04", title: "Protect", body: "Finish mornings with SPF to protect results.", productId: "7" },
];

export function RoutineBuilder() {
  return (
    <section id="routine" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">Get Started</p>
        <h2 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">
          Build Your Peptide Routine
        </h2>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((item) => {
          const product = getProductById(item.productId);
          return (
            <Link
              key={item.step}
              href={product ? `/products/${product.slug}` : "/shop"}
              className="group flex flex-col rounded-2xl border border-border-soft bg-cream p-5 transition-colors hover:border-sage"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-2xl text-champagne">{item.step}</span>
                {product && (
                  <ProductVisual product={product} className="h-16 w-16 rounded-xl" />
                )}
              </div>
              <p className="mt-4 text-base font-medium text-charcoal">{item.title}</p>
              <p className="mt-1 text-sm text-stone-500">{item.body}</p>
              {product && (
                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-stone-600 group-hover:text-charcoal">
                  {product.name} · {formatCurrency(product.price)}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
