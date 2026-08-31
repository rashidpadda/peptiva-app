import type { NextConfig } from "next";

// Nothing in this codebase restricted who's allowed to iframe it before
// this - closing that gap for the real checkout entry point specifically.
// CHECKOUT_ALLOWED_PARENT_ORIGIN should be set to peptiva's real domain(s)
// before this goes anywhere near production.
const allowedParentOrigin = process.env.CHECKOUT_ALLOWED_PARENT_ORIGIN;

const checkoutHost = (process.env.NEXT_PUBLIC_CHECKOUT_API_BASE_URL ?? "").replace(/^https?:\/\//, "");

// The Jumio identity step's "IdFrameSubmitted" wait is resolved by a
// SignalR push from the browser directly to the checkout backend's
// notification hub (src/lib/signalr.ts) - unlike every other checkout
// call, which goes through our own server and is never subject to CSP.
// Ported from deposit-onboarding's next.config.mjs, which confirmed live
// (2026-07-17) that without the backend host (wss:// included, for the
// WebSocket transport) AND *.service.signalr.net - the managed Azure
// SignalR Service instance the hub's negotiate handshake redirects to, a
// different host per environment - in connect-src, Chromium silently
// blocks the connection with an opaque "Failed to fetch"/negotiation
// failure, not a server-side CORS/auth problem. Scoped to just the two
// routes that actually need it (the real checkout flow), not applied
// globally, so nothing else in this app is affected.
function buildCsp(includeFrameAncestors: boolean): string {
  return [
    "default-src 'self'",
    // 'self' is required here for /checkout-entry's own same-origin
    // <iframe src="/checkout-widget"> - frame-src does NOT fall back to
    // default-src once explicitly set, so omitting it silently blocks the
    // whole embed (confirmed: this exact omission broke the checkout
    // entirely on first deploy of this CSP). The Jumio domains are for the
    // nested identity iframe rendered inside /checkout-widget itself.
    "frame-src 'self' https://*.jumio.ai https://*.jumio.com https://netverify.com https://*.netverify.com",
    // https://ddc.worldpay.com is WorldPay's ThreatMetrix device-
    // fingerprinting beacon (src/lib/useFraudBeacon.ts), loaded as an
    // inline-injected <script src>, required before card payment or the
    // backend's risk engine rejects the transaction with "Forbidden" -
    // confirmed live (2026-08-29) that skipping this beacon entirely (a
    // bare random sessionID with no registered fingerprint) gets rejected.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ddc.worldpay.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    [
      "connect-src 'self'",
      checkoutHost && `https://${checkoutHost} wss://${checkoutHost}`,
      "https://*.service.signalr.net wss://*.service.signalr.net",
      // The beacon also opens an RTCPeerConnection through a TURN relay on
      // this host as a second fingerprinting signal.
      "https://*.online-metrix.net wss://*.online-metrix.net",
    ]
      .filter(Boolean)
      .join(" "),
    includeFrameAncestors
      ? `frame-ancestors 'self'${allowedParentOrigin ? ` ${allowedParentOrigin}` : ""}`
      : null,
  ]
    .filter(Boolean)
    .join("; ");
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/checkout-entry",
        headers: [{ key: "Content-Security-Policy", value: buildCsp(true) }],
      },
      {
        source: "/checkout-widget",
        headers: [{ key: "Content-Security-Policy", value: buildCsp(false) }],
      },
    ];
  },
};

export default nextConfig;
