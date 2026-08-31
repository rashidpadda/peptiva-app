"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { OrderParams } from "@/lib/checkoutSession";

// No order review/confirmation screen by design - payment success redirects
// straight back to peptiva's app. This iframe can't navigate its parent
// directly, so it posts completion up to the entry ("app") page instead,
// which does the actual redirect to returnUrl. Restricted to
// CHECKOUT_ALLOWED_PARENT_ORIGIN when set (falls back to "*" only if that
// env var is unset, e.g. local dev without it configured yet).
const PARENT_ORIGIN = process.env.NEXT_PUBLIC_CHECKOUT_ALLOWED_PARENT_ORIGIN || "*";

export function CheckoutSuccessStep({
  paymentReference,
  order,
}: {
  paymentReference: string;
  order: OrderParams;
}) {
  useEffect(() => {
    window.parent.postMessage(
      { type: "peptiva-checkout-complete", paymentReference, orderId: order.orderId },
      PARENT_ORIGIN
    );
  }, [paymentReference, order.orderId]);

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-sage" />
      <p className="mt-4 text-sm text-stone-500">Redirecting you back to Peptide Rails...</p>
    </div>
  );
}
