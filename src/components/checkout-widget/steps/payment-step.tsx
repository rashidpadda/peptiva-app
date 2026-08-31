"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, MapPin, XCircle } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  formatCardNumber,
  formatExpiry,
  isValidCardNumber,
  isValidCvv,
  isValidExpiry,
} from "@/lib/validation";
import { formatCurrency } from "@/lib/utils";
import {
  getAccessToken,
  getCardEncryptionKey,
  getOrCreatePaymentSessionId,
  clearAuthSession,
} from "@/lib/checkoutSession";
import type { OrderParams } from "@/lib/checkoutSession";
import type { Address } from "@/lib/types";
import { buildCardPaymentPayload } from "@/lib/cardEncryption";

type CardDetails = { cardholderName: string; cardNumber: string; expiry: string; cvv: string };
type Phase = "idle" | "processing" | "declined";

const EMPTY_CARD: CardDetails = { cardholderName: "", cardNumber: "", expiry: "", cvv: "" };

type CoolOffInfo = {
  bInCoolOff: boolean;
  maxOrdersInCoolOff: number | null;
  remainingOrders: number;
  maxOrderAmountUSD: number | null;
  coolOffTimeRemainingMinutes: number;
};

// Mirrors the reference backend's formatCoolOffRemaining exactly.
function formatCoolOffRemaining(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  return parts.length > 0 ? parts.join(" ") : "less than a minute";
}

// Real payment call against the order's fixed amount/currency (via
// /api/checkout/pay), replacing the simulated-latency/fake-decline demo
// logic used in the mock storefront's payment steps.
export function CheckoutPaymentStep({
  order,
  address,
  phone,
  onEditShipping,
  onSessionExpired,
  onSuccess,
}: {
  order: OrderParams;
  address: Address;
  phone: string;
  onEditShipping: () => void;
  onSessionExpired: () => void;
  onSuccess: (paymentReference: string) => void;
}) {
  const [card, setCard] = useState<CardDetails>(EMPTY_CARD);
  const [errors, setErrors] = useState<Partial<Record<keyof CardDetails, string>>>({});
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [coolOffInfo, setCoolOffInfo] = useState<CoolOffInfo | null>(null);

  // Mirrors the reference backend's own pre-payment cool-off/order-limit
  // check (CheckOut.tsx, fetched on reaching order confirmation) - warns
  // about account-level order limits before the customer fills in card
  // details, rather than only finding out from a rejected payment.
  // Advisory only: a failed/unavailable check never blocks the form.
  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) return;
    let cancelled = false;
    fetch("/api/checkout/cool-off-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, quickBuyKey: order.quickBuyKey }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.ok) setCoolOffInfo(data.coolOffInfo ?? null);
      })
      .catch(() => {
        if (!cancelled) setCoolOffInfo(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clears a field's own validation error the moment it's edited, instead
  // of leaving a stale "required"/"invalid" message on screen until the
  // next full submit re-validates everything.
  function updateCard(field: keyof CardDetails, value: string) {
    setCard((c) => ({ ...c, [field]: value }));
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  }

  async function handlePay(e?: React.FormEvent) {
    e?.preventDefault();
    const next: Partial<Record<keyof CardDetails, string>> = {};
    if (!card.cardholderName.trim()) next.cardholderName = "Cardholder name is required";
    if (!isValidCardNumber(card.cardNumber)) next.cardNumber = "Enter a valid card number";
    if (!isValidExpiry(card.expiry)) next.expiry = "Enter a valid, unexpired date (MM/YY)";
    if (!isValidCvv(card.cvv)) next.cvv = "Enter a valid CVV";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPhase("processing");
    setErrorMessage(null);
    setErrorDetail(null);
    setSessionExpired(false);
    try {
      const accessToken = getAccessToken();
      const encryption = getCardEncryptionKey();
      if (!accessToken || !encryption) {
        clearAuthSession();
        setErrorMessage("Your session expired. Please verify your email again.");
        setSessionExpired(true);
        setPhase("declined");
        return;
      }

      const payload = await buildCardPaymentPayload({
        encryption,
        sessionID: getOrCreatePaymentSessionId(),
        amount: order.amount,
        currency: order.currency,
        cardNumber: card.cardNumber,
        cardExpiry: card.expiry,
        cardCvv: card.cvv,
        cardholderName: card.cardholderName,
        address,
        acceptedTerms: true,
      });

      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, quickBuyKey: order.quickBuyKey, payload }),
      });
      const data = await res.json();
      if (!data.ok) {
        setErrorMessage(data.error ?? "Your payment could not be completed.");
        setErrorDetail(data.detail ?? null);
        setPhase("declined");
        return;
      }
      onSuccess(data.paymentReference);
    } catch {
      setErrorMessage("Couldn't reach the payment service. Please try again.");
      setErrorDetail(null);
      setPhase("declined");
    }
  }

  if (phase === "processing") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-sage" />
        <p className="font-serif text-xl text-charcoal">Processing payment...</p>
        <p className="text-sm text-stone-500">Please don&apos;t close this window.</p>
      </div>
    );
  }

  if (phase === "declined") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <XCircle className="h-10 w-10 text-red-500" />
        <p className="font-serif text-xl text-charcoal">{errorMessage}</p>
        {errorDetail && (
          <p className="max-w-sm break-words rounded-lg bg-beige/60 px-3 py-1.5 font-mono text-[11px] text-stone-500">
            {errorDetail}
          </p>
        )}
        {sessionExpired ? (
          <Button className="mt-2" onClick={onSessionExpired}>
            Verify Email Again
          </Button>
        ) : (
          <Button className="mt-2" onClick={() => setPhase("idle")}>
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handlePay}>
      <p className="mb-4 text-sm text-stone-500">Enter your card details to complete your order.</p>

      {coolOffInfo?.bInCoolOff && !!coolOffInfo.maxOrdersInCoolOff && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-champagne/60 bg-champagne/15 px-4 py-3 text-xs text-stone-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
          <span>
            {`During this period you can place a maximum of ${coolOffInfo.maxOrdersInCoolOff} order${coolOffInfo.maxOrdersInCoolOff === 1 ? "" : "s"}. You have ${coolOffInfo.remainingOrders} order${coolOffInfo.remainingOrders === 1 ? "" : "s"} remaining.`}
            {coolOffInfo.maxOrderAmountUSD != null &&
              ` Each order is limited to a maximum of $${coolOffInfo.maxOrderAmountUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD.`}
            {coolOffInfo.coolOffTimeRemainingMinutes > 0 &&
              ` This period ends in ${formatCoolOffRemaining(coolOffInfo.coolOffTimeRemainingMinutes)}.`}
          </span>
        </div>
      )}

      <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-border-soft bg-ivory px-4 py-3 text-sm">
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
          type="button"
          onClick={onEditShipping}
          className="shrink-0 text-xs font-medium text-sage-dark underline underline-offset-4"
        >
          Edit
        </button>
      </div>

      <div className="space-y-4">
        <FormField label="Cardholder Name" htmlFor="cw-name" error={errors.cardholderName}>
          <Input
            id="cw-name"
            autoFocus
            value={card.cardholderName}
            onChange={(e) => updateCard("cardholderName", e.target.value)}
            error={errors.cardholderName}
          />
        </FormField>
        <FormField label="Card Number" htmlFor="cw-number" error={errors.cardNumber}>
          <Input
            id="cw-number"
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            value={card.cardNumber}
            onChange={(e) => updateCard("cardNumber", formatCardNumber(e.target.value))}
            error={errors.cardNumber}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Expiration" htmlFor="cw-expiry" error={errors.expiry}>
            <Input
              id="cw-expiry"
              inputMode="numeric"
              placeholder="MM/YY"
              value={card.expiry}
              onChange={(e) => updateCard("expiry", formatExpiry(e.target.value))}
              error={errors.expiry}
            />
          </FormField>
          <FormField label="CVV" htmlFor="cw-cvv" error={errors.cvv}>
            <Input
              id="cw-cvv"
              inputMode="numeric"
              maxLength={4}
              value={card.cvv}
              onChange={(e) => updateCard("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
              error={errors.cvv}
            />
          </FormField>
        </div>
      </div>

      <Button
        type="submit"
        className="mt-5 w-full"
        size="lg"
        disabled={!!(coolOffInfo?.bInCoolOff && coolOffInfo.remainingOrders <= 0)}
      >
        {`Pay ${formatCurrency(order.amount, order.currency)}`}
      </Button>
    </form>
  );
}
