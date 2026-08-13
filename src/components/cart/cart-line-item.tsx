"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, Heart, Undo2 } from "lucide-react";
import type { CartItem } from "@/lib/types";
import { getProductById } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { ProductVisual } from "@/components/product/product-visual";

export function CartLineItem({ item }: { item: CartItem }) {
  const product = getProductById(item.productId);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const saveForLater = useCartStore((s) => s.saveForLater);
  const moveToCart = useCartStore((s) => s.moveToCart);

  if (!product) return null;

  return (
    <div className="flex gap-4 border-b border-border-soft py-6 first:pt-0 last:border-0">
      <Link href={`/products/${product.slug}`}>
        <ProductVisual product={product} className="h-28 w-28 shrink-0 rounded-xl" />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/products/${product.slug}`} className="font-serif text-base text-charcoal hover:underline">
              {product.name}
            </Link>
            <p className="mt-1 text-xs text-stone-500">{product.size}</p>
          </div>
          <span className="text-sm font-medium text-charcoal">
            {formatCurrency(product.price * item.quantity)}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          {item.savedForLater ? (
            <button
              onClick={() => moveToCart(item.productId)}
              className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-charcoal"
            >
              <Undo2 className="h-3.5 w-3.5" /> Move to bag
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-full border border-stone-300">
              <button
                className="flex h-8 w-8 items-center justify-center text-stone-600 disabled:opacity-30"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                disabled={item.quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!Number.isNaN(val) && val >= 1) updateQuantity(item.productId, val);
                }}
                className="w-9 bg-transparent text-center text-sm focus:outline-none"
                aria-label="Quantity"
              />
              <button
                className="flex h-8 w-8 items-center justify-center text-stone-600"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-4">
            {!item.savedForLater && (
              <button
                onClick={() => saveForLater(item.productId)}
                className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-charcoal"
              >
                <Heart className="h-3.5 w-3.5" /> Save for later
              </button>
            )}
            <button
              onClick={() => removeItem(item.productId)}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
