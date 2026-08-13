import Link from "next/link";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product/product-card";

export function BestSellers() {
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">
            Customer Favorites
          </p>
          <h2 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">Best Sellers</h2>
        </div>
        <Link
          href="/shop?filter=bestseller"
          className="hidden text-sm font-medium text-stone-600 underline underline-offset-4 hover:text-charcoal sm:block"
        >
          View all
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
        {bestsellers.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
