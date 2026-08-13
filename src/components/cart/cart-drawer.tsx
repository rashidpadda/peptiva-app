"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { getProductById } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import {
  useCartStore,
  activeCartItems,
  getSubtotal,
  FREE_SHIPPING_THRESHOLD,
} from "@/store/cart";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ProductVisual } from "@/components/product/product-visual";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const active = activeCartItems(items);
  const subtotal = getSubtotal(items);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && closeDrawer()}>
      <SheetContent className="p-6">
        <SheetTitle>Your Bag {active.length > 0 && `(${active.length})`}</SheetTitle>

        {active.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="font-serif text-xl text-charcoal">Your bag is empty</p>
            <p className="text-sm text-stone-500">Add a few favorites to get started.</p>
            <Button asChild className="mt-2" onClick={closeDrawer}>
              <Link href="/shop">Shop Products</Link>
            </Button>
          </div>
        ) : (
          <>
            {remaining > 0 ? (
              <p className="mt-4 rounded-lg bg-beige px-3 py-2 text-xs text-stone-700">
                Add {formatCurrency(remaining)} more for complimentary shipping.
              </p>
            ) : (
              <p className="mt-4 rounded-lg bg-sage/15 px-3 py-2 text-xs font-medium text-sage-dark">
                You&apos;ve unlocked complimentary shipping.
              </p>
            )}

            <div className="mt-4 flex-1 space-y-5 overflow-y-auto pr-1">
              {active.map((item) => {
                const product = getProductById(item.productId);
                if (!product) return null;
                return (
                  <div key={item.productId} className="flex gap-3">
                    <Link href={`/products/${product.slug}`} onClick={closeDrawer}>
                      <ProductVisual
                        product={product}
                        className="h-20 w-20 shrink-0 rounded-lg"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={closeDrawer}
                          className="text-sm text-charcoal hover:underline"
                        >
                          {product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId)}
                          aria-label="Remove item"
                          className="text-stone-400 hover:text-charcoal"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-stone-500">{product.size}</p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 rounded-full border border-stone-300">
                          <button
                            className="flex h-7 w-7 items-center justify-center text-stone-600 disabled:opacity-30"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs">{item.quantity}</span>
                          <button
                            className="flex h-7 w-7 items-center justify-center text-stone-600"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-medium text-charcoal">
                          {formatCurrency(product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-border-soft pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-medium text-charcoal">{formatCurrency(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-stone-400">Shipping and taxes calculated at checkout.</p>
              <div className="mt-4 grid gap-2">
                <Button asChild size="lg" onClick={closeDrawer}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" onClick={closeDrawer}>
                  <Link href="/cart">View Bag</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
