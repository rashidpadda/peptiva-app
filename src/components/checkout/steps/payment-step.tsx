"use client";

import { useState } from "react";
import { CreditCard, Wallet, Smartphone } from "lucide-react";
import type { CardDetails, PaymentMethod } from "@/lib/types";
import {
  formatCardNumber,
  formatExpiry,
  isValidCardNumber,
  isValidExpiry,
  isValidCvv,
} from "@/lib/validation";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
  { value: "card", label: "Credit / Debit Card", icon: CreditCard },
  { value: "paypal", label: "PayPal", icon: Wallet },
  { value: "apple-pay", label: "Apple Pay", icon: Smartphone },
];

const EMPTY_CARD: CardDetails = { cardholderName: "", cardNumber: "", expiry: "", cvv: "" };

export function PaymentStep({
  initialMethod,
  initialCard,
  onBack,
  onContinue,
}: {
  initialMethod: PaymentMethod;
  initialCard: CardDetails | null;
  onBack: () => void;
  onContinue: (method: PaymentMethod, card: CardDetails | null) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>(initialMethod);
  const [card, setCard] = useState<CardDetails>(initialCard ?? EMPTY_CARD);
  const [errors, setErrors] = useState<Partial<Record<keyof CardDetails, string>>>({});

  function fillDemoCard() {
    setCard({
      cardholderName: "Jordan Ellis",
      cardNumber: "4242 4242 4242 4242",
      expiry: "12/30",
      cvv: "123",
    });
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (method !== "card") {
      onContinue(method, null);
      return;
    }

    const nextErrors: Partial<Record<keyof CardDetails, string>> = {};
    if (!card.cardholderName.trim()) nextErrors.cardholderName = "Cardholder name is required";
    if (!isValidCardNumber(card.cardNumber)) nextErrors.cardNumber = "Enter a valid 16-digit card number";
    if (!isValidExpiry(card.expiry)) nextErrors.expiry = "Enter a valid, unexpired date (MM/YY)";
    if (!isValidCvv(card.cvv)) nextErrors.cvv = "Enter a valid CVV";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onContinue(method, card);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-champagne/60 bg-champagne/15 px-4 py-3 text-xs text-stone-700">
        <span className="font-medium">Demo Payment</span> — this is a simulated checkout. No real
        payment is processed and no card details are stored.
      </div>

      <RadioGroup value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
        {PAYMENT_OPTIONS.map(({ value, label, icon: Icon }) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-300 p-4 has-[[data-state=checked]]:border-charcoal"
          >
            <RadioGroupItem value={value} />
            <Icon className="h-4 w-4 text-stone-500" />
            <span className="text-sm font-medium text-charcoal">{label}</span>
          </label>
        ))}
      </RadioGroup>

      {method === "card" && (
        <div className="space-y-5 rounded-xl border border-border-soft p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Card Details
            </p>
            <button
              type="button"
              onClick={fillDemoCard}
              className="text-xs font-medium text-sage-dark underline underline-offset-4"
            >
              Use demo card
            </button>
          </div>

          <FormField label="Cardholder Name" htmlFor="cardholderName" error={errors.cardholderName}>
            <Input
              id="cardholderName"
              value={card.cardholderName}
              onChange={(e) => setCard((c) => ({ ...c, cardholderName: e.target.value }))}
              error={errors.cardholderName}
              autoComplete="cc-name"
            />
          </FormField>

          <FormField label="Card Number" htmlFor="cardNumber" error={errors.cardNumber}>
            <Input
              id="cardNumber"
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              value={card.cardNumber}
              onChange={(e) => setCard((c) => ({ ...c, cardNumber: formatCardNumber(e.target.value) }))}
              error={errors.cardNumber}
              autoComplete="cc-number"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-5">
            <FormField label="Expiration Date" htmlFor="expiry" error={errors.expiry}>
              <Input
                id="expiry"
                inputMode="numeric"
                placeholder="MM/YY"
                value={card.expiry}
                onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                error={errors.expiry}
                autoComplete="cc-exp"
              />
            </FormField>
            <FormField label="CVV" htmlFor="cvv" error={errors.cvv}>
              <Input
                id="cvv"
                inputMode="numeric"
                placeholder="123"
                maxLength={4}
                value={card.cvv}
                onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                error={errors.cvv}
                autoComplete="cc-csc"
              />
            </FormField>
          </div>
        </div>
      )}

      {method === "paypal" && (
        <div className="rounded-xl border border-border-soft p-5 text-sm text-stone-600">
          You&apos;ll be securely redirected to PayPal to complete your payment. (Simulated for this demo.)
        </div>
      )}

      {method === "apple-pay" && (
        <div className="rounded-xl border border-border-soft p-5 text-sm text-stone-600">
          Use Face ID or Touch ID to confirm payment with Apple Pay. (Simulated for this demo.)
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none">
          Review Order
        </Button>
      </div>
    </form>
  );
}
