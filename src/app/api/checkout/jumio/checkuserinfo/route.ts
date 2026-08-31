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

// Step 3: name-match check, fired automatically once Jumio itself reports
// capture success, and again (with typed-in names) if the first check comes
// back InfoNotVerified. Mirrors the reference backend's Selfie.tsx checkUserInfo.
export async function POST(request: NextRequest) {
  try {
    const origin = getRequestOrigin(request);
    const { accessToken, customerFirstName, customerLastName, quickBuyKey } = await request.json();
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "Missing accessToken." }, { status: 400 });
    }

    const res = await checkoutApiRequest<JumioVerificationStatusDetails>(checkoutEndpoints.jumioCheckUserInfo, {
      accessToken,
      origin,
      widgetKey: quickBuyKey,
      body: { customerFirstName: customerFirstName ?? "", customerLastName: customerLastName ?? "" },
    });

    if (res.status !== "1") {
      return NextResponse.json({ ok: false, ...describeApiFailure(res) }, { status: 502 });
    }

    const { status, additionalData } = normalizeVerificationStatus(res.details);
    return NextResponse.json({ ok: true, status, additionalData });
  } catch (err) {
    const status = err instanceof CheckoutConfigError ? 500 : 502;
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to verify your details." },
      { status }
    );
  }
}
