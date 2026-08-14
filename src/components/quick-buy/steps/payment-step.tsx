"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, MapPin, XCircle } from "lucide-react";
import type { Address, Order } from "@/lib/types";
import {
  DECLINE_TEST_CARD,
  formatCardNumber,
  formatExpiry,
  isValidCardNumber,
  isValidCvv,
  isValidExpiry,
} from "@/lib/validation";
import { formatCurrency } from "@/lib/utils";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type CardDetails = {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

type Phase = "idle" | "processing" | "verifying" | "approved" | "declined";

const EMPTY_CARD: CardDetails = { cardholderName: "", cardNumber: "", expiry: "", cvv: "" };

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function PaymentStep({
  total,
  address,
  phone,
  onAttemptPayment,
  onSuccess,
  onEditAddress,
}: {
  total: number;
  address: Address;
  phone: string;
  onAttemptPayment: (card: CardDetails) => Order | null;
  onSuccess: (order: Order) => void;
  onEditAddress: () => void;
}) {
  const [card, setCard] = useState<CardDetails>(EMPTY_CARD);
  const [errors, setErrors] = useState<Partial<Record<keyof CardDetails, string>>>({});
  const [phase, setPhase] = useState<Phase>("idle");

  function fillDemoCard() {
    setCard({
      cardholderName: "Jordan Ellis",
      cardNumber: "4242 4242 4242 4242",
      expiry: "12/30",
      cvv: "123",
    });
    setErrors({});
  }

  async function handlePay() {
    const next: Partial<Record<keyof CardDetails, string>> = {};
    if (!card.cardholderName.trim()) next.cardholderName = "Cardholder name is required";
    if (!isValidCardNumber(card.cardNumber)) next.cardNumber = "Enter a valid 16-digit card number";
    if (!isValidExpiry(card.expiry)) next.expiry = "Enter a valid, unexpired date (MM/YY)";
    if (!isValidCvv(card.cvv)) next.cvv = "Enter a valid CVV";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPhase("processing");
    await delay(1000);
    setPhase("verifying");
    await delay(900);

    const order = onAttemptPayment(card);
    if (order) {
      setPhase("approved");
      await delay(700);
      onSuccess(order);
    } else {
      setPhase("declined");
    }
  }

  if (phase === "processing" || phase === "verifying") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-sage" />
        <p className="font-serif text-xl text-charcoal">
          {phase === "processing" ? "Processing payment..." : "Verifying payment..."}
        </p>
        <p className="text-sm text-stone-500">Please don&apos;t close this window.</p>
      </div>
    );
  }

  if (phase === "approved") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <CheckCircle2 className="h-10 w-10 text-sage" />
        <p className="font-serif text-xl text-charcoal">Payment approved</p>
      </div>
    );
  }

  if (phase === "declined") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <XCircle className="h-10 w-10 text-red-500" />
        <p className="font-serif text-xl text-charcoal">Your payment could not be completed.</p>
        <p className="max-w-xs text-sm text-stone-500">
          Please check your payment details and try again.
        </p>
        <Button className="mt-2" onClick={() => setPhase("idle")}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-stone-500">Enter your card details to complete the order.</p>

      <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-border-soft bg-ivory px-4 py-3 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500">Shipping to</p>
            <p className="text-stone-700">
              {address.address1}
              {address.address2 ? `, ${address.address2}` : ""}, {address.city}, {address.state}{" "}
              {address.zip}
            </p>
            <p className="mt-0.5 text-stone-500">{phone}</p>
          </div>
        </div>
        <button
          onClick={onEditAddress}
          className="shrink-0 text-xs font-medium text-sage-dark underline underline-offset-4"
        >
          Edit
        </button>
      </div>

      <div className="mb-5 flex items-center justify-between rounded-xl border border-champagne/60 bg-champagne/15 px-4 py-3 text-xs text-stone-700">
        <span>Demo Payment — no real card is charged.</span>
        <button onClick={fillDemoCard} className="font-medium text-sage-dark underline underline-offset-4 shrink-0 ml-3">
          Use demo card
        </button>
      </div>

      <div className="space-y-4">
        <FormField label="Cardholder Name" htmlFor="qb-name" error={errors.cardholderName}>
          <Input
            id="qb-name"
            value={card.cardholderName}
            onChange={(e) => setCard((c) => ({ ...c, cardholderName: e.target.value }))}
            error={errors.cardholderName}
          />
        </FormField>
        <FormField label="Card Number" htmlFor="qb-number" error={errors.cardNumber}>
          <Input
            id="qb-number"
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            value={card.cardNumber}
            onChange={(e) => setCard((c) => ({ ...c, cardNumber: formatCardNumber(e.target.value) }))}
            error={errors.cardNumber}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Expiration" htmlFor="qb-expiry" error={errors.expiry}>
            <Input
              id="qb-expiry"
              inputMode="numeric"
              placeholder="MM/YY"
              value={card.expiry}
              onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
              error={errors.expiry}
            />
          </FormField>
          <FormField label="CVV" htmlFor="qb-cvv" error={errors.cvv}>
            <Input
              id="qb-cvv"
              inputMode="numeric"
              placeholder="123"
              maxLength={4}
              value={card.cvv}
              onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
              error={errors.cvv}
            />
          </FormField>
        </div>
      </div>

      <p className="mt-4 text-xs text-stone-400">
        Demo decline card: {formatCardNumber(DECLINE_TEST_CARD)}
      </p>

      <Button className="mt-3 w-full" size="lg" onClick={handlePay}>
        {`Pay ${formatCurrency(total)}`}
      </Button>
    </div>
  );
}
