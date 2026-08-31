import { NextResponse, type NextRequest } from "next/server";
import {
  checkoutApiRequest,
  checkoutEndpoints,
  normalizeVerificationStatus,
  describeApiFailure,
  CheckoutConfigError,
  type JumioVerificationStatusDetails,
} from "@/lib/checkoutApi";
import { getRequestOrigin } from "@/lib/requestOrigin";

// Step 1 (IdCollectConsent -> IdFrame): the user accepted the consent
// screen client-side. Mirrors the reference backend's Selfie.tsx consent
// handler - POSTs { jumioConsent: true } to the same backend endpoint it
// uses, authenticated as this signed-in customer (not a direct Jumio call).
export async function POST(request: NextRequest) {
  try {
    const origin = getRequestOrigin(request);
    const { accessToken, quickBuyKey } = await request.json();
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "Missing accessToken." }, { status: 400 });
    }

    const res = await checkoutApiRequest<JumioVerificationStatusDetails>(
      checkoutEndpoints.jumioVerificationStatus,
      { accessToken, origin, widgetKey: quickBuyKey, body: { jumioConsent: true } }
    );

    if (res.status !== "1") {
      return NextResponse.json({ ok: false, ...describeApiFailure(res) }, { status: 502 });
    }

    const { status, additionalData } = normalizeVerificationStatus(res.details);
    return NextResponse.json({ ok: true, status, additionalData });
  } catch (err) {
    const status = err instanceof CheckoutConfigError ? 500 : 502;
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to start identity verification." },
      { status }
    );
  }
}
