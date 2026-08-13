import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductVisual } from "@/components/product/product-visual";
import { getProductById } from "@/data/products";

export function Hero() {
  const featured = getProductById("1")!;
  const secondary = getProductById("8")!;

  return (
    <section className="relative overflow-hidden bg-beige">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <div className="max-w-xl">
          <span className="inline-flex items-center rounded-full border border-sage/40 bg-sage/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-sage-dark">
            Advanced Peptides. Visible Confidence.
          </span>
          <h1 className="mt-5 font-serif text-4xl leading-[1.1] text-charcoal sm:text-5xl lg:text-6xl">
            Peptide-powered skincare, thoughtfully formulated.
          </h1>
          <p className="mt-5 max-w-md text-base text-stone-600 sm:text-lg">
            Discover targeted formulas designed to support smoother, firmer,
            healthier-looking skin.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/shop?filter=bestseller">Shop Best Sellers</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/#peptide-science">Explore Peptide Science</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-champagne/25 blur-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <ProductVisual
              product={featured}
              className="col-span-2 aspect-[4/3] rounded-3xl border border-white/60"
            />
            <ProductVisual
              product={secondary}
              className="aspect-square rounded-2xl border border-white/60"
            />
            <div className="flex flex-col justify-center rounded-2xl border border-white/60 bg-cream p-5">
              <p className="font-serif text-3xl text-charcoal">4.8/5</p>
              <p className="mt-1 text-xs text-stone-500">
                Average rating across 1,200+ verified reviews
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
