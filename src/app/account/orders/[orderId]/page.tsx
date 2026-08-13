"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useOrdersStore } from "@/store/orders";
import { getProductBySlug } from "@/data/products";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProductVisual } from "@/components/product/product-visual";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default function AccountOrderDetailPage(
  props: PageProps<"/account/orders/[orderId]">
) {
  const { orderId } = use(props.params);
  const order = useOrdersStore((s) => s.getOrder(orderId));

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="font-serif text-xl text-charcoal">Order not found</p>
        <Link href="/account/orders" className="mt-3 inline-block text-sm text-sage-dark underline underline-offset-4">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-charcoal"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">{order.id}</h2>
          <p className="text-sm text-stone-500">Placed {formatDate(order.date)}</p>
        </div>
        <Badge variant="subtle">{STATUS_LABEL[order.status]}</Badge>
      </div>

      <div className="mt-6 rounded-2xl border border-border-soft p-6">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-stone-500">Items</p>
        <div className="space-y-4">
          {order.items.map((item) => {
            const product = getProductBySlug(item.slug);
            return (
              <div key={item.productId} className="flex items-center gap-3">
                {product && <ProductVisual product={product} className="h-14 w-14 rounded-lg" />}
                <div className="flex-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-sm text-charcoal hover:underline"
                  >
                    {item.name}
                  </Link>
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

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border-soft p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
            Shipping Address
          </p>
          <p className="mt-2 text-sm text-charcoal">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </p>
          <p className="text-sm text-stone-600">{order.shippingAddress.address1}</p>
          <p className="text-sm text-stone-600">
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          </p>
        </div>
        <div className="rounded-2xl border border-border-soft p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Payment</p>
          <p className="mt-2 text-sm text-charcoal capitalize">
            {order.paymentMethod.replace("-", " ")}
          </p>
        </div>
      </div>
    </div>
  );
}
