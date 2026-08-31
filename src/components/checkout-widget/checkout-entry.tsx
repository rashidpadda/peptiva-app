"use client";

import { useEffect } from "react";
import { Lock } from "lucide-react";

// The checkout iframe is served by this same app (/checkout-widget), so
// this only needs to check the message shape - the cross-origin allowlist
// that matters here is CHECKOUT_ALLOWED_PARENT_ORIGIN, which gates who is
// allowed to iframe *this* entry page in the first place (see next.config.ts
// frame-ancestors) and which origin the iframe is told to postMessage back
// to (see success-step.tsx).
export function CheckoutEntry({ iframeSrc }: { iframeSrc: string }) {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.type !== "peptiva-checkout-complete") return;

      const url = new URL(iframeSrc, window.location.origin);
      const returnUrl = url.searchParams.get("returnUrl");
      if (!returnUrl) return;

      const dest = new URL(returnUrl);
      dest.searchParams.set("paymentReference", data.paymentReference);
      dest.searchParams.set("orderId", data.orderId);
      window.location.href = dest.toString();
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [iframeSrc]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ivory px-4 py-10">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/20 blur-[100px]" />

      <p className="mb-3 font-serif text-lg tracking-wide text-charcoal/70">PEPTIDE RAILS</p>
      <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-sage/40 bg-sage/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-sage-dark">
        <Lock className="h-3 w-3" />
        Secure Checkout
      </span>

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border-soft bg-cream shadow-2xl shadow-charcoal/10">
        <iframe src={iframeSrc} title="Peptide Rails Checkout" className="h-[720px] w-full border-0" />
      </div>
    </div>
  );
}
