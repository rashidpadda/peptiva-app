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

// Escalates to manual review. Mirrors the reference backend's
// JumioFailure.tsx / JumioCooldown.tsx "Request help" handler.
export async function POST(request: NextRequest) {
  try {
    const origin = getRequestOrigin(request);
    const { accessToken, quickBuyKey } = await request.json();
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "Missing accessToken." }, { status: 400 });
    }

    const res = await checkoutApiRequest<JumioVerificationStatusDetails>(
      checkoutEndpoints.jumioRequestManualVerification,
      { accessToken, origin, widgetKey: quickBuyKey }
    );

    if (res.status !== "1") {
      return NextResponse.json({ ok: false, ...describeApiFailure(res) }, { status: 502 });
    }

    const { status, additionalData } = normalizeVerificationStatus(res.details);
    return NextResponse.json({ ok: true, status, additionalData });
  } catch (err) {
    const status = err instanceof CheckoutConfigError ? 500 : 502;
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Couldn't request manual verification." },
      { status }
    );
  }
}
