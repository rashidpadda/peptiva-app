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

// Step 2: fired once, when Jumio's hosted iframe posts a completion
// message. Mirrors the reference backend's JumioIframe.tsx handleComplete - no
// body, just tells the backend to go fetch the completed submission from
// Jumio itself.
export async function POST(request: NextRequest) {
  try {
    const origin = getRequestOrigin(request);
    const { accessToken, quickBuyKey } = await request.json();
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "Missing accessToken." }, { status: 400 });
    }

    const res = await checkoutApiRequest<JumioVerificationStatusDetails>(checkoutEndpoints.jumioIdSubmit, {
      accessToken,
      origin,
      widgetKey: quickBuyKey,
    });

    if (res.status !== "1") {
      return NextResponse.json({ ok: false, ...describeApiFailure(res) }, { status: 502 });
    }

    const { status, additionalData } = normalizeVerificationStatus(res.details);
    return NextResponse.json({ ok: true, status, additionalData });
  } catch (err) {
    const status = err instanceof CheckoutConfigError ? 500 : 502;
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to confirm your submission." },
      { status }
    );
  }
}
