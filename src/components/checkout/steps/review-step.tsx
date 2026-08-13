"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { Address, CardDetails, CustomerInfo, Order, PaymentMethod, ShippingMethod } from "@/lib/types";
import { getProductById } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import { ProductVisual } from "@/components/product/product-visual";
import { OrderSummary } from "@/components/cart/order-summary";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";

type Phase = "idle" | "processing" | "verifying" | "approved" | "declined";

function maskCard(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, "");
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: "Credit / Debit Card",
  paypal: "PayPal",
  "apple-pay": "Apple Pay",
};

export function ReviewStep({
  customer,
  address,
  shippingMethod,
  paymentMethod,
  card,
  subtotal,
  shipping,
  tax,
  discount,
  total,
  onBack,
  onEditStep,
  onPlaceOrder,
  onSuccess,
}: {
  customer: CustomerInfo;
  address: Address;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  card: CardDetails | null;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  onBack: () => void;
  onEditStep: (step: 1 | 2 | 3) => void;
  onPlaceOrder: () => Order | null;
  onSuccess: (order: Order) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const items = useCartStore((s) => s.items);
  const activeItems = items.filter((i) => !i.savedForLater);

  async function handlePlaceOrder() {
    setPhase("processing");
    await new Promise((r) => setTimeout(r, 1100));
    setPhase("verifying");
    await new Promise((r) => setTimeout(r, 1100));

    const order = onPlaceOrder();
    if (order) {
      setPhase("approved");
      await new Promise((r) => setTimeout(r, 700));
      onSuccess(order);
    } else {
      setPhase("declined");
    }
  }

  if (phase !== "idle") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        {(phase === "processing" || phase === "verifying") && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-sage" />
            <p className="font-serif text-xl text-charcoal">
              {phase === "processing" ? "Processing payment..." : "Verifying payment..."}
            </p>
            <p className="text-sm text-stone-500">Please don&apos;t close this window.</p>
          </>
        )}
        {phase === "approved" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-sage" />
            <p className="font-serif text-xl text-charcoal">Payment approved</p>
          </>
        )}
        {phase === "declined" && (
          <>
            <XCircle className="h-10 w-10 text-red-500" />
            <p className="font-serif text-xl text-charcoal">
              Your payment could not be completed.
            </p>
            <p className="max-w-sm text-sm text-stone-500">
              Please check your payment details and try again.
            </p>
            <div className="mt-2 flex gap-3">
              <Button variant="secondary" onClick={() => setPhase("idle")}>
                Try Again
              </Button>
              <Button onClick={() => onEditStep(3)}>Change Payment Method</Button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border-soft p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Contact</p>
          <button onClick={() => onEditStep(1)} className="text-xs text-sage-dark underline underline-offset-4">
            Edit
          </button>
        </div>
        <p className="mt-2 text-sm text-charcoal">
          {customer.firstName} {customer.lastName}
        </p>
        <p className="text-sm text-stone-500">{customer.email}</p>
        <p className="text-sm text-stone-500">{customer.phone}</p>
      </div>

      <div className="rounded-xl border border-border-soft p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
            Shipping to
          </p>
          <button onClick={() => onEditStep(2)} className="text-xs text-sage-dark underline underline-offset-4">
            Edit
          </button>
        </div>
        <p className="mt-2 text-sm text-charcoal">
          {address.address1}
          {address.address2 ? `, ${address.address2}` : ""}
        </p>
        <p className="text-sm text-stone-500">
          {address.city}, {address.state} {address.zip}, {address.country}
        </p>
        <p className="mt-2 text-sm text-stone-500">
          {shippingMethod === "express" ? "Express Shipping (2-3 business days)" : "Standard Shipping (5-7 business days)"}
        </p>
      </div>

      <div className="rounded-xl border border-border-soft p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Payment</p>
          <button onClick={() => onEditStep(3)} className="text-xs text-sage-dark underline underline-offset-4">
            Edit
          </button>
        </div>
        <p className="mt-2 text-sm text-charcoal">{PAYMENT_LABELS[paymentMethod]}</p>
        {paymentMethod === "card" && card && (
          <p className="text-sm text-stone-500">{maskCard(card.cardNumber)}</p>
        )}
      </div>

      <div className="rounded-xl border border-border-soft p-5">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-stone-500">
          Items ({activeItems.length})
        </p>
        <div className="space-y-4">
          {activeItems.map((item) => {
            const product = getProductById(item.productId);
            if (!product) return null;
            return (
              <div key={item.productId} className="flex items-center gap-3">
                <ProductVisual product={product} className="h-14 w-14 rounded-lg" />
                <div className="flex-1">
                  <p className="text-sm text-charcoal">{product.name}</p>
                  <p className="text-xs text-stone-500">Qty {item.quantity}</p>
                </div>
                <span className="text-sm text-charcoal">
                  {formatCurrency(product.price * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <OrderSummary
        subtotal={subtotal}
        shipping={shipping}
        tax={tax}
        discount={discount}
        total={total}
        showPromo={false}
      />

      <div className="flex gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" className="flex-1 sm:flex-none" onClick={handlePlaceOrder}>
          Place Order
        </Button>
      </div>
    </div>
  );
}
