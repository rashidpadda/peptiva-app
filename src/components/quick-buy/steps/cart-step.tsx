"use client";

import {
  useCartStore,
  activeCartItems,
  getSubtotal,
  getShipping,
  getTax,
  getDiscount,
  getTotal,
} from "@/store/cart";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { OrderSummary } from "@/components/cart/order-summary";
import { Button } from "@/components/ui/button";

export function CartStep({ onContinue }: { onContinue: () => void }) {
  const items = useCartStore((s) => s.items);
  const promoCode = useCartStore((s) => s.promoCode);
  const shippingMethod = useCartStore((s) => s.shippingMethod);

  const active = activeCartItems(items);
  const subtotal = getSubtotal(items);
  const discount = getDiscount(subtotal, promoCode);
  const shipping = getShipping(subtotal, shippingMethod);
  const tax = getTax(subtotal, discount);
  const total = getTotal(subtotal, shipping, tax, discount);

  return (
    <div>
      <p className="mb-4 text-sm text-stone-500">Review your bag before continuing.</p>

      <div className="max-h-[320px] overflow-y-auto pr-1">
        {active.map((item) => (
          <CartLineItem key={item.productId} item={item} />
        ))}
      </div>

      <div className="mt-5">
        <OrderSummary subtotal={subtotal} shipping={shipping} tax={tax} discount={discount} total={total} />
      </div>

      <Button className="mt-5 w-full" size="lg" onClick={onContinue}>
        Continue to Shipping
      </Button>
    </div>
  );
}
