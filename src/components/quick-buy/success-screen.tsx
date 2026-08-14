import Link from "next/link";
import { CheckCircle2, Mail, MapPin } from "lucide-react";
import type { Order } from "@/lib/types";
import { getProductBySlug } from "@/data/products";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProductVisual } from "@/components/product/product-visual";
import { Button } from "@/components/ui/button";

export function QuickBuySuccess({
  order,
  onContinueShopping,
}: {
  order: Order;
  onContinueShopping: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sage/15 text-sage-dark">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h2 className="mt-5 font-serif text-3xl text-charcoal">Order placed</h2>
      <p className="mt-1 text-sm text-stone-500">Your peptide ritual is on its way.</p>
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-beige px-3 py-1 text-xs text-stone-600">
        <Mail className="h-3.5 w-3.5" />
        Confirmation sent to {order.customer.email}
      </p>

      <div className="mt-6 rounded-2xl border border-border-soft bg-ivory p-5 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
            Order {order.id}
          </span>
          <span className="text-xs text-stone-500">{formatDate(order.date)}</span>
        </div>

        <div className="mt-4 space-y-3">
          {order.items.map((item) => {
            const product = getProductBySlug(item.slug);
            return (
              <div key={item.productId} className="flex items-center gap-3">
                {product && (
                  <ProductVisual product={product} className="h-12 w-12 shrink-0 rounded-lg" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-charcoal">{item.name}</p>
                  <p className="text-xs text-stone-500">Qty {item.quantity}</p>
                </div>
                <span className="shrink-0 text-sm text-charcoal">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-border-soft pt-4 text-sm">
          <div className="flex justify-between text-stone-500">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sage-dark">
              <span>Discount</span>
              <span>−{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-stone-500">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-stone-500">
            <span>Tax</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
        </div>

        <div className="mt-3 flex justify-between border-t border-border-soft pt-3">
          <span className="font-medium text-charcoal">Total</span>
          <span className="font-serif text-lg text-charcoal">{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-border-soft bg-ivory p-4 text-left text-sm">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Shipping to</p>
          <p className="mt-0.5 text-stone-700">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </p>
          <p className="text-stone-500">
            {order.shippingAddress.address1}
            {order.shippingAddress.address2 ? `, ${order.shippingAddress.address2}` : ""},{" "}
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button size="lg" className="flex-1" onClick={onContinueShopping}>
          Continue Shopping
        </Button>
        <Button asChild variant="secondary" size="lg" className="flex-1">
          <Link href={`/order-confirmation/${order.id}`}>View Order</Link>
        </Button>
      </div>
    </div>
  );
}
