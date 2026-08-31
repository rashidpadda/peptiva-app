"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import type { Address } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { EmailVerifyStep } from "./steps/email-verify-step";
import { IdentityStep } from "./steps/identity-step";
import { ShippingStep } from "./steps/shipping-step";
import { CheckoutPaymentStep } from "./steps/payment-step";
import { CheckoutSuccessStep } from "./steps/success-step";
import { getOrCreatePaymentSessionId } from "@/lib/checkoutSession";
import type { JumioStatus, OrderParams } from "@/lib/checkoutSession";
import { useFraudBeacon } from "@/lib/useFraudBeacon";

type Stage = "verify" | "shipping" | "identity" | "payment" | "success";

const STAGE_LABELS: Record<Exclude<Stage, "success">, string> = {
  verify: "Verify",
  shipping: "Shipping",
  identity: "Identity",
  payment: "Payment",
};

const EMPTY_ADDRESS: Address = {
  firstName: "",
  lastName: "",
  address1: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
};

// Order-driven checkout, not product-selection - the order (amount,
// currency, id) arrives entirely via iframe params from the host app.
// Verify -> Shipping (always, every order needs a delivery address
// regardless of verification status) -> [Identity, only if the backend
// says KYC is still required] -> Payment -> Success. Matches the order
// the original demo widget used (shipping before identity).
export function CheckoutWidgetShell({ order }: { order: OrderParams }) {
  const [stage, setStage] = useState<Stage>("verify");
  const [jumioStatus, setJumioStatus] = useState<JumioStatus | null>(null);
  const [needsIdentity, setNeedsIdentity] = useState(false);
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [phone, setPhone] = useState("");
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  // Generated and registered with WorldPay's fraud-detection network as
  // early as possible - device fingerprinting needs time to complete
  // before the payment call references this same ID, not just an instant
  // before submission (see useFraudBeacon.ts).
  const [paymentSessionId] = useState(() => getOrCreatePaymentSessionId());
  useFraudBeacon(paymentSessionId);

  const steps: Exclude<Stage, "success">[] = needsIdentity
    ? ["verify", "shipping", "identity", "payment"]
    : ["verify", "shipping", "payment"];
  const currentIndex = stage === "success" ? steps.length : steps.indexOf(stage as Exclude<Stage, "success">);

  return (
    <div className="flex min-h-full w-full items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {stage !== "success" && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-border-soft bg-ivory px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-beige text-sage-dark">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-stone-500">Order</p>
                <p className="mt-0.5 text-sm text-stone-600">{order.orderId}</p>
              </div>
            </div>
            <p className="font-serif text-2xl text-charcoal">
              {formatCurrency(order.amount, order.currency)}
            </p>
          </div>
        )}

        {stage !== "success" && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium uppercase tracking-wider text-stone-500">
                Step {currentIndex + 1} of {steps.length}
              </span>
              <span className="font-medium uppercase tracking-wider text-sage-dark">
                {STAGE_LABELS[stage as Exclude<Stage, "success">]}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-beige">
              <div
                className="h-full rounded-full bg-sage transition-all duration-500 ease-out"
                style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="mt-2.5 flex justify-between px-0.5">
              {steps.map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                    i <= currentIndex ? "bg-sage" : "bg-beige"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-border-soft bg-cream p-6 shadow-2xl shadow-charcoal/10 sm:p-8">
          <div key={stage} className="animate-fade-up">
            {stage === "verify" && (
              <EmailVerifyStep
                quickBuyKey={order.quickBuyKey}
                onVerified={(verified, status) => {
                  setNeedsIdentity(!verified);
                  setJumioStatus(verified ? null : status);
                  setStage("shipping");
                }}
              />
            )}
            {stage === "shipping" && (
              <ShippingStep
                initialAddress={address}
                initialPhone={phone}
                nextLabel={needsIdentity ? "Continue to Identity Verification" : "Continue to Payment"}
                onContinue={(value, phoneValue) => {
                  setAddress(value);
                  setPhone(phoneValue);
                  setStage(needsIdentity ? "identity" : "payment");
                }}
              />
            )}
            {stage === "identity" && (
              <IdentityStep
                initialStatus={jumioStatus}
                quickBuyKey={order.quickBuyKey}
                onContinue={() => setStage("payment")}
              />
            )}
            {stage === "payment" && (
              <CheckoutPaymentStep
                order={order}
                address={address}
                phone={phone}
                onEditShipping={() => setStage("shipping")}
                onSessionExpired={() => setStage("verify")}
                onSuccess={(ref) => {
                  setPaymentReference(ref);
                  setStage("success");
                }}
              />
            )}
            {stage === "success" && paymentReference && (
              <CheckoutSuccessStep paymentReference={paymentReference} order={order} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
