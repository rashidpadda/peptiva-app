"use client";

import { CreditCard, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { usePaymentMethodsStore } from "@/store/payment-methods";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccountPaymentMethodsPage() {
  const methods = usePaymentMethodsStore((s) => s.methods);
  const removeMethod = usePaymentMethodsStore((s) => s.removeMethod);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">Manage the payment methods on your account.</p>
        <Button asChild size="sm">
          <Link href="/checkout">Add at Checkout</Link>
        </Button>
      </div>

      {methods.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <CreditCard className="h-8 w-8 text-stone-400" />
          <p className="text-sm text-stone-500">No saved payment methods yet.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {methods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between rounded-2xl border border-border-soft p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-14 items-center justify-center rounded-md bg-beige">
                  <CreditCard className="h-4 w-4 text-stone-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">
                    {method.brand} •••• {method.last4}
                    {method.isDefault && (
                      <span className="ml-2 rounded-full bg-beige px-2 py-0.5 text-[10px] uppercase tracking-wider text-stone-600">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-stone-500">Expires {method.expiry}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  removeMethod(method.id);
                  toast("Payment method removed");
                }}
                aria-label="Remove payment method"
                className="text-stone-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-stone-400">
        This is a demo account — no real card details are stored or processed.
      </p>
    </div>
  );
}
