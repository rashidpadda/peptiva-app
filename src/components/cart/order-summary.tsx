"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function OrderSummary({
  subtotal,
  shipping,
  tax,
  discount,
  total,
  showPromo = true,
}: {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  showPromo?: boolean;
}) {
  const promoCode = useCartStore((s) => s.promoCode);
  const applyPromoCode = useCartStore((s) => s.applyPromoCode);
  const removePromoCode = useCartStore((s) => s.removePromoCode);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    const success = applyPromoCode(code);
    if (success) {
      toast.success("Promo code applied", { description: "10% off your order" });
      setError("");
      setCode("");
    } else {
      setError("This promo code is not valid.");
    }
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-cream p-6">
      <p className="font-serif text-lg text-charcoal">Order Summary</p>

      {showPromo && (
        <div className="mt-4">
          {promoCode ? (
            <div className="flex items-center justify-between rounded-lg bg-sage/15 px-3 py-2 text-sm text-sage-dark">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> {promoCode} applied
              </span>
              <button onClick={removePromoCode} aria-label="Remove promo code">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter promo code"
                className="bg-white"
              />
              <Button type="submit" variant="secondary" size="md">
                Apply
              </Button>
            </form>
          )}
          {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          <p className="mt-1.5 text-[11px] text-stone-400">Try: PEPTIDE10</p>
        </div>
      )}

      <div className="mt-5 space-y-2.5 border-t border-border-soft pt-5 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-600">Subtotal</span>
          <span className="text-charcoal">{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sage-dark">
            <span>Discount</span>
            <span>−{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-stone-600">Shipping</span>
          <span className="text-charcoal">{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-600">Estimated tax</span>
          <span className="text-charcoal">{formatCurrency(tax)}</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between border-t border-border-soft pt-4">
        <span className="font-medium text-charcoal">Total</span>
        <span className="font-serif text-xl text-charcoal">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
