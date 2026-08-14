"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/store/favorites";
import { products } from "@/data/products";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { PageBrandMark } from "@/components/layout/page-brand-mark";

export default function FavoritesPage() {
  const productIds = useFavoritesStore((s) => s.productIds);
  const favoriteProducts = products.filter((p) => productIds.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageBrandMark />
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-sage-dark">Saved Items</p>
      <h1 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">Favorites</h1>

      {favoriteProducts.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-beige">
            <Heart className="h-6 w-6 text-stone-500" />
          </div>
          <p className="font-serif text-xl text-charcoal">Your favorites are waiting.</p>
          <Button asChild size="lg" className="mt-2">
            <Link href="/shop">Explore Products</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10">
          <ProductGrid products={favoriteProducts} />
        </div>
      )}
    </div>
  );
}
