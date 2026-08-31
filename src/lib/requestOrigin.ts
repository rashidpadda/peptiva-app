import type { NextRequest } from "next/server";

// req.nextUrl.origin reflects the Host header as the Next.js process itself
// sees it. Behind a reverse proxy/ingress (a hosted deployment), that's
// often rewritten to an internal address while the real public host is
// forwarded separately via the standard X-Forwarded-Host/Proto headers - so
// prefer those when present. Plain local `next dev` has no proxy in front
// of it and sends neither header, so it falls through to req.nextUrl.origin
// (correctly localhost). Mirrors deposit-onboarding's requestOrigin.ts,
// which the real checkout backend gateway is already known to accept.
export function getRequestOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (!forwardedHost) return req.nextUrl.origin;

  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  return `${forwardedProto}://${forwardedHost}`;
}
