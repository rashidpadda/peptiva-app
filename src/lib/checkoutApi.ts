// Server-only client for the real peptiva checkout backend (email
// verification, sign-in, payment). Never import this from a "use client"
// component - it reads CHECKOUT_WIDGET_KEY, which must stay server-side.
// Only the /api/checkout/* route handlers should call this.
//
// Calling convention deliberately mirrors ibanera's existing crypto-widget
// reference backend integration: a widget-identity header identifies this
// integration, an optional Bearer token identifies the signed-in customer,
// and every response is the same { id, details, metadata, status, errors[] }
// envelope. This points at a peptiva-scoped base URL/key, not the crypto
// on-ramp's - the header name/URL path below are the backend's literal
// contract, not a naming choice; confirm with backend if peptiva's
// integration uses different ones.

export class CheckoutConfigError extends Error {}

const API_PREFIX = "/api/v2/widgetrole/quickbuymodule";

// Paths mirror the reference backend integration's endpoint map exactly,
// per explicit instruction to reuse its APIs rather than a peptiva-specific
// contract. Jumio calls go through this same backend too (not a direct
// Jumio integration) - that's what lets "already verified" persist per
// customer account across orders.
export const checkoutEndpoints = {
  verifyEmail: `${API_PREFIX}/verify-emailAddress`,
  signIn: `${API_PREFIX}/sign-in`,
  payWithSavedCard: `${API_PREFIX}/paywithsavedcard`,
  payWithNewCard: `${API_PREFIX}/submitnewcardform`,
  jumioVerificationStatus: `${API_PREFIX}/verificationstatus`,
  jumioIdSubmit: `${API_PREFIX}/idsubmit`,
  jumioCheckUserInfo: `${API_PREFIX}/checkuserinfo`,
  jumioRequestManualVerification: `${API_PREFIX}/requestmanualverification`,
  // Account-level order-limit/fraud-cooldown check the reference backend
  // fetches when the customer reaches its order-confirmation step, to warn
  // about limits *before* they submit rather than only finding out from a
  // rejected payment. Tied to the customer account's own verification/
  // compliance status on this backend, not to crypto specifically, so it
  // plausibly applies to any purchase through this account - added per
  // explicit instruction to mirror the reference structure and fill gaps.
  coolOffInfo: `${API_PREFIX}/cooloff-info`,
};

export type JumioAdditionalData = { iframeUrl?: string; bManualAvailable?: boolean } | null;

export type JumioVerificationStatusDetails = {
  jumioVerificationStatusObj?: { status?: string; additionalData?: JumioAdditionalData } | null;
  verificationStatus?: string;
  status?: string;
  additionalData?: JumioAdditionalData;
};

// Backend responses for Jumio-related calls aren't consistent about whether
// status/additionalData are nested under jumioVerificationStatusObj or
// flattened at the top level - the reference client normalizes both shapes
// defensively too, so this does the same.
export function normalizeVerificationStatus(details: JumioVerificationStatusDetails | undefined): {
  status: string | null;
  additionalData: JumioAdditionalData;
} {
  return {
    status: details?.jumioVerificationStatusObj?.status ?? details?.verificationStatus ?? details?.status ?? null,
    additionalData: details?.jumioVerificationStatusObj?.additionalData ?? details?.additionalData ?? null,
  };
}

// Fiat/product-only fallback terms text, shown when the backend doesn't
// return its own termsAndConditions HTML, or when it does but it mentions a
// crypto concept (see sanitizeTermsHtml below) - Peptide Rails sells
// physical products, this must never surface digital-asset/NFT/crypto
// wording no matter what the backend sends. Plain text, no guessed legal
// URLs - swap in real Terms/Privacy links once confirmed.
export const DEFAULT_TERMS_HTML = "I agree to the Terms &amp; Conditions and Privacy Policy.";

// The verify-emailAddress response can return its own termsAndConditions
// HTML, and this exact backend has been observed (live UAT, same API
// peptiva-widget calls) returning crypto-flavored copy ("Digital Asset
// Custody Terms & Conditions", "NFT Terms of Service") even though this
// integration is fiat/product-only end to end. Since that HTML would be
// rendered raw, never trust it blindly - if it mentions any crypto/
// digital-asset concept, fall back to DEFAULT_TERMS_HTML instead of trying
// to surgically edit someone else's HTML.
const CRYPTO_TERMS_PATTERN = /\b(nft|digital[\s-]?asset|crypto(?:currency)?|token)\b/i;

export function sanitizeTermsHtml(html: string): string {
  return CRYPTO_TERMS_PATTERN.test(html) ? DEFAULT_TERMS_HTML : html;
}

export type CheckoutApiResponse<T = unknown> = {
  id: number;
  details: T;
  metadata: unknown;
  status: "0" | "1";
  errors: { type: string; fieldName?: string; messageCode?: string }[];
};

// A "0" envelope status is a business-logic failure the gateway still
// answers with HTTP 200 for (e.g. rate-limited, invalid state transition,
// stale session) - `details` is typically empty/null in that case. Missed
// checking this in every Jumio route originally: they went straight to
// normalizeVerificationStatus(res.details) regardless of res.status, so a
// "0" response silently surfaced as a generic "no status field" error
// instead of the backend's actual reason. Call this whenever
// res.status !== "1" and return its result to the client instead.
export function describeApiFailure(res: CheckoutApiResponse<unknown>): { error: string; detail: string } {
  const first = res.errors?.[0];
  return {
    error: first?.messageCode ?? "The checkout backend rejected this request.",
    detail: first
      ? `Backend error: ${first.messageCode}${first.fieldName ? ` (field: ${first.fieldName})` : ""}`
      : `Backend returned status "${res.status}" with no error detail`,
  };
}

// widgetKeyOverride is the ?quickBuyKey= param forwarded from the checkout
// URL (see checkout-widget/page.tsx), mirroring deposit-onboarding's own
// gatewayHeaders() precedence exactly: `overrideKey || process.env.
// QUICKBUY_KEY`. A per-request key from the embedding host takes
// precedence; CHECKOUT_WIDGET_KEY is only the fallback for local/manual
// testing when no key is supplied via the URL.
function getConfig(widgetKeyOverride?: string): { baseUrl: string; widgetKey: string } {
  const baseUrl = process.env.CHECKOUT_API_BASE_URL;
  const widgetKey = widgetKeyOverride || process.env.CHECKOUT_WIDGET_KEY;
  if (!baseUrl || !widgetKey) {
    throw new CheckoutConfigError(
      "CHECKOUT_API_BASE_URL must be set in the environment, and a widget key must be supplied " +
        "either via ?quickBuyKey= on the checkout URL or CHECKOUT_WIDGET_KEY in the environment."
    );
  }
  return { baseUrl, widgetKey };
}

export async function checkoutApiRequest<T = unknown>(
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: unknown;
    accessToken?: string;
    origin?: string;
    widgetKey?: string;
  } = {}
): Promise<CheckoutApiResponse<T>> {
  const { method = "POST", body, accessToken, origin, widgetKey: widgetKeyOverride } = options;
  const { baseUrl, widgetKey } = getConfig(widgetKeyOverride);

  // The gateway in front of CHECKOUT_API_BASE_URL rejects requests that
  // don't look like they came from a registered caller - both headers
  // below are required, confirmed against the real gateway by
  // deposit-onboarding's proven working integration (src/lib/quickbuy/
  // service.ts's gatewayHeaders): lowercase "quickbuy-key" per merchant,
  // and "origin" set to the calling app's own host per-request (see
  // src/lib/requestOrigin.ts), not a static configured value.
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "quickbuy-key": widgetKey,
  };
  if (origin) headers["origin"] = origin;
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as CheckoutApiResponse<T> | null;
  if (!data) {
    throw new Error(`Checkout API request to ${path} failed with status ${response.status}`);
  }
  return data;
}
