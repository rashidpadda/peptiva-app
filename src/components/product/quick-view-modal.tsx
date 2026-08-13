"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductVisual } from "@/components/product/product-visual";
import { RatingStars } from "@/components/product/rating-stars";
import { Button } from "@/components/ui/button";

function QuickViewBody({
  product,
  onOpenChange,
}: {
  product: Product;
  onOpenChange: (open: boolean) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <ProductVisual product={product} className="aspect-square rounded-xl" />
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-wider text-stone-500">{product.category}</span>
        <DialogTitle className="mt-1">{product.name}</DialogTitle>
        <div className="mt-2 flex items-center gap-2">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-stone-400">({product.reviewCount})</span>
        </div>
        <div className="mt-3 font-medium text-lg text-charcoal">
          {formatCurrency(product.price)}
        </div>
        <p className="mt-3 text-sm text-stone-600">{product.shortDescription}</p>

        <div className="mt-5 flex items-center gap-1 rounded-full border border-stone-300 w-fit">
          <button
            className="flex h-10 w-10 items-center justify-center text-stone-600 disabled:opacity-30"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            className="flex h-10 w-10 items-center justify-center text-stone-600"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            className="flex-1"
            onClick={() => {
              addItem(product.id, quantity);
              toast.success("Added to your bag", { description: product.name });
              onOpenChange(false);
            }}
          >
            Add to Cart
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => toggleFavorite(product.id)}
            aria-label="Toggle favorite"
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
          </Button>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="mt-4 text-xs font-medium uppercase tracking-wider text-stone-500 underline underline-offset-4 hover:text-charcoal"
        >
          View full details
        </Link>
      </div>
    </div>
  );
}

export function QuickViewModal({
  product,
  onOpenChange,
}: {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      {product && (
        <DialogContent className="max-w-2xl">
          <QuickViewBody key={product.id} product={product} onOpenChange={onOpenChange} />
        </DialogContent>
      )}
    </Dialog>
  );
}
