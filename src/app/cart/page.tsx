"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import {
  useCartStore,
  activeCartItems,
  savedCartItems,
  getSubtotal,
  getShipping,
  getTax,
  getDiscount,
  getTotal,
} from "@/store/cart";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { OrderSummary } from "@/components/cart/order-summary";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const promoCode = useCartStore((s) => s.promoCode);
  const shippingMethod = useCartStore((s) => s.shippingMethod);

  const active = activeCartItems(items);
  const saved = savedCartItems(items);

  const subtotal = getSubtotal(items);
  const discount = getDiscount(subtotal, promoCode);
  const shipping = getShipping(subtotal, shippingMethod);
  const tax = getTax(subtotal, discount);
  const total = getTotal(subtotal, shipping, tax, discount);

  if (active.length === 0 && saved.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-32 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-beige">
          <ShoppingBag className="h-6 w-6 text-stone-500" />
        </div>
        <h1 className="font-serif text-2xl text-charcoal">Your bag is empty</h1>
        <p className="text-sm text-stone-500">Explore our peptide formulas and start your routine.</p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/shop">Explore Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-charcoal">
        <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-charcoal sm:text-4xl">Your Bag</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {active.length > 0 ? (
            <div>{active.map((item) => <CartLineItem key={item.productId} item={item} />)}</div>
          ) : (
            <p className="text-sm text-stone-500">
              No items currently in your bag. Everything is saved for later below.
            </p>
          )}

          {saved.length > 0 && (
            <div className="mt-10">
              <p className="mb-2 font-serif text-lg text-charcoal">Saved for Later ({saved.length})</p>
              <div>{saved.map((item) => <CartLineItem key={item.productId} item={item} />)}</div>
            </div>
          )}
        </div>

        <div>
          <OrderSummary
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            discount={discount}
            total={total}
          />
          {active.length > 0 ? (
            <Button asChild size="lg" className="mt-4 w-full">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          ) : (
            <Button size="lg" className="mt-4 w-full" disabled>
              Proceed to Checkout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
