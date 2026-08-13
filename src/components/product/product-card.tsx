"use client";

import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { ProductVisual } from "@/components/product/product-visual";
import { RatingStars } from "@/components/product/rating-stars";
import { Badge } from "@/components/ui/badge";

export function ProductCard({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView?: (product: Product) => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border-soft">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <ProductVisual product={product} className="h-full w-full" />
        </Link>

        {product.badge && (
          <Badge
            variant={product.badge === "Bestseller" ? "sage" : product.badge === "New" ? "champagne" : "default"}
            className="absolute left-3 top-3"
          >
            {product.badge}
          </Badge>
        )}

        <button
          type="button"
          onClick={() => {
            toggleFavorite(product.id);
            toast(isFavorite ? "Removed from favorites" : "Added to favorites");
          }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-sm transition-transform hover:scale-105"
        >
          <Heart className={cn("h-4 w-4 transition-colors", isFavorite && "fill-red-500 text-red-500")} />
        </button>

        <button
          type="button"
          onClick={() => {
            if (onQuickView) {
              onQuickView(product);
            } else {
              addItem(product.id, 1);
              toast.success("Added to your bag", { description: product.name });
            }
          }}
          className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-1.5 rounded-full bg-charcoal py-2.5 text-xs font-medium uppercase tracking-wider text-ivory opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:flex"
        >
          <Plus className="h-3.5 w-3.5" />
          {onQuickView ? "Quick View" : "Quick Add"}
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-wider text-stone-500">{product.category}</span>
        <Link href={`/products/${product.slug}`} className="font-serif text-base text-charcoal hover:underline underline-offset-4">
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-stone-500">{product.shortDescription}</p>
        <div className="mt-1 flex items-center gap-2">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-stone-400">({product.reviewCount})</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-medium text-charcoal">{formatCurrency(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-stone-400 line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
