"use client";

import { use } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useOrdersStore } from "@/store/orders";
import { getProductBySlug } from "@/data/products";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProductVisual } from "@/components/product/product-visual";
import { Button } from "@/components/ui/button";

export default function OrderConfirmationPage(
  props: PageProps<"/order-confirmation/[orderId]">
) {
  const { orderId } = use(props.params);
  const order = useOrdersStore((s) => s.getOrder(orderId));

  if (!order) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-32 text-center">
        <h1 className="font-serif text-2xl text-charcoal">Order not found</h1>
        <p className="text-sm text-stone-500">
          We couldn&apos;t find an order with this ID on this device.
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const shippingLabel =
    order.shippingMethod === "express"
      ? "Express Shipping (2-3 business days)"
      : "Standard Shipping (5-7 business days)";

  const paymentLabel =
    order.paymentMethod === "card"
      ? "Credit / Debit Card"
      : order.paymentMethod === "paypal"
        ? "PayPal"
        : "Apple Pay";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="h-12 w-12 text-sage" />
        <h1 className="mt-4 font-serif text-3xl text-charcoal sm:text-4xl">
          Thank you for your order.
        </h1>
        <p className="mt-2 text-sm text-stone-500">Your peptide ritual is on its way.</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-border-soft bg-cream p-6 sm:grid-cols-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-stone-500">Order Number</p>
          <p className="mt-1 text-sm font-medium text-charcoal">{order.id}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-stone-500">Order Date</p>
          <p className="mt-1 text-sm font-medium text-charcoal">{formatDate(order.date)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-stone-500">Email</p>
          <p className="mt-1 truncate text-sm font-medium text-charcoal">{order.customer.email}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-stone-500">Est. Delivery</p>
          <p className="mt-1 text-sm font-medium text-charcoal">
            {order.shippingMethod === "express" ? "2-3 business days" : "5-7 business days"}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border-soft p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
            Shipping Address
          </p>
          <p className="mt-2 text-sm text-charcoal">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </p>
          <p className="text-sm text-stone-600">
            {order.shippingAddress.address1}
            {order.shippingAddress.address2 ? `, ${order.shippingAddress.address2}` : ""}
          </p>
          <p className="text-sm text-stone-600">
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          </p>
          <p className="text-sm text-stone-600">{order.shippingAddress.country}</p>
          <p className="mt-3 text-xs text-stone-500">{shippingLabel}</p>
        </div>
        <div className="rounded-2xl border border-border-soft p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Payment</p>
          <p className="mt-2 text-sm text-charcoal">{paymentLabel}</p>
          <p className="mt-1 text-xs text-stone-500">Demo transaction — no charge was made.</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border-soft p-6">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-stone-500">
          Order Items
        </p>
        <div className="space-y-4">
          {order.items.map((item) => {
            const product = getProductBySlug(item.slug);
            return (
              <div key={item.productId} className="flex items-center gap-3">
                {product && <ProductVisual product={product} className="h-14 w-14 rounded-lg" />}
                <div className="flex-1">
                  <p className="text-sm text-charcoal">{item.name}</p>
                  <p className="text-xs text-stone-500">Qty {item.quantity}</p>
                </div>
                <span className="text-sm text-charcoal">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-2 border-t border-border-soft pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-600">Subtotal</span>
            <span className="text-charcoal">{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sage-dark">
              <span>Discount</span>
              <span>−{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-stone-600">Shipping</span>
            <span className="text-charcoal">
              {order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600">Tax</span>
            <span className="text-charcoal">{formatCurrency(order.tax)}</span>
          </div>
          <div className="flex justify-between border-t border-border-soft pt-2 font-medium text-charcoal">
            <span>Total</span>
            <span className="font-serif text-lg">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href={`/account/orders/${order.id}`}>View Order</Link>
        </Button>
      </div>
    </div>
  );
}
