"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/store/favorites";
import { products } from "@/data/products";
import { ProductGrid } from "@/components/product/product-grid";

export default function AccountFavoritesPage() {
  const productIds = useFavoritesStore((s) => s.productIds);
  const favoriteProducts = products.filter((p) => productIds.includes(p.id));

  if (favoriteProducts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Heart className="h-8 w-8 text-stone-400" />
        <p className="font-serif text-xl text-charcoal">Your favorites are waiting.</p>
        <Link href="/shop" className="text-sm text-sage-dark underline underline-offset-4">
          Explore Products
        </Link>
      </div>
    );
  }

  return <ProductGrid products={favoriteProducts} />;
}
