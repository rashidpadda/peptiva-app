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

// Retries a failed/expired verification session. Mirrors the reference backend's
// JumioFailure.tsx retry handler - POSTs { retry: true } to the same
// verificationstatus endpoint the initial consent call uses.
export async function POST(request: NextRequest) {
  try {
    const origin = getRequestOrigin(request);
    const { accessToken, quickBuyKey } = await request.json();
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "Missing accessToken." }, { status: 400 });
    }

    const res = await checkoutApiRequest<JumioVerificationStatusDetails>(
      checkoutEndpoints.jumioVerificationStatus,
      { accessToken, origin, widgetKey: quickBuyKey, body: { retry: true } }
    );

    if (res.status !== "1") {
      return NextResponse.json({ ok: false, ...describeApiFailure(res) }, { status: 502 });
    }

    const { status, additionalData } = normalizeVerificationStatus(res.details);
    return NextResponse.json({ ok: true, status, additionalData });
  } catch (err) {
    const status = err instanceof CheckoutConfigError ? 500 : 502;
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Couldn't restart verification." },
      { status }
    );
  }
}
