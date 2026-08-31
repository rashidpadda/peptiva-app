"use client";

// Per-checkout-session client state, scoped to this iframe's own origin -
// not shared with the host page embedding it. Holds the backend access
// token and a per-session clientSignature for the lifetime of this one
// checkout only. Uses sessionStorage rather than a localStorage token
// pattern deliberately: a checkout session shouldn't silently resume
// across tabs or later visits the way a signed-in crypto-widget session
// does - each order gets a fresh verification.

export type JumioStatus = {
  status: string | null;
  additionalData: { iframeUrl?: string; bManualAvailable?: boolean } | null;
};

export type OrderParams = {
  orderId: string;
  amount: number;
  currency: string;
  email?: string;
  returnUrl?: string;
  checkoutToken?: string;
  // Same role as deposit-onboarding's ?quickBuyKey= - an opaque
  // per-integration key the embedding host supplies via the URL, taking
  // precedence over the server's CHECKOUT_WIDGET_KEY fallback (see
  // src/lib/checkoutApi.ts's getConfig).
  quickBuyKey?: string;
};

export type CardEncryptionKey = { keyId: string; publicKey: string };

const SESSION_KEY = "peptiva-checkout-session";

type CheckoutSessionData = {
  clientSignature: string;
  accessToken?: string;
  encryption?: CardEncryptionKey;
  // Not the sign-in response's own session field - the real fraud-
  // detection beacon that's supposed to generate this (WorldPay/
  // ThreatMetrix, per deposit-onboarding's src/app/page.tsx comment) isn't
  // run here either, so this is a fresh client-side UUID as a best-effort
  // stand-in, same as deposit-onboarding does. If payment ever fails with
  // a "Forbidden"-shaped error, the missing fraud beacon is the next thing
  // to investigate - not a bug in this value itself.
  paymentSessionId?: string;
};

function randomClientSignature(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}

function readSession(): CheckoutSessionData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as CheckoutSessionData) : null;
  } catch {
    return null;
  }
}

export function getOrCreateClientSignature(): string {
  const existing = readSession();
  if (existing?.clientSignature) return existing.clientSignature;
  const clientSignature = randomClientSignature();
  saveCheckoutSession({ clientSignature });
  return clientSignature;
}

export function saveCheckoutSession(data: Partial<CheckoutSessionData>) {
  if (typeof window === "undefined") return;
  try {
    const existing = readSession() ?? { clientSignature: randomClientSignature() };
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...existing, ...data }));
  } catch {
    // Storage blocked/unavailable - a failed write just means a new
    // clientSignature gets generated on the next call, which is harmless.
  }
}

export function getAccessToken(): string | undefined {
  return readSession()?.accessToken;
}

export function getCardEncryptionKey(): CardEncryptionKey | undefined {
  return readSession()?.encryption;
}

export function getOrCreatePaymentSessionId(): string {
  const existing = readSession()?.paymentSessionId;
  if (existing) return existing;
  const id = crypto.randomUUID();
  saveCheckoutSession({ paymentSessionId: id });
  return id;
}

// Drops the stale accessToken/encryption when a downstream call reports the
// session expired, so a re-verification genuinely starts fresh instead of
// silently reusing a token the backend has already rejected once. Keeps
// clientSignature/paymentSessionId - those correlate this browser session,
// not the customer's authenticated identity.
export function clearAuthSession() {
  if (typeof window === "undefined") return;
  try {
    const existing = readSession();
    if (!existing) return;
    window.sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        clientSignature: existing.clientSignature,
        paymentSessionId: existing.paymentSessionId,
      })
    );
  } catch {
    // Storage blocked/unavailable - nothing to clear.
  }
}
