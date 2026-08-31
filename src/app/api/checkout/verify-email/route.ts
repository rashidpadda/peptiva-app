import { NextResponse, type NextRequest } from "next/server";
import {
  checkoutApiRequest,
  checkoutEndpoints,
  normalizeVerificationStatus,
  sanitizeTermsHtml,
  describeApiFailure,
  CheckoutConfigError,
  type JumioVerificationStatusDetails,
} from "@/lib/checkoutApi";
import { getRequestOrigin } from "@/lib/requestOrigin";

type VerifyEmailDetails = {
  accessToken?: string;
  verificationStatus?: string;
  termsAndConditions?: string;
  encryption?: { keyId: string; publicKey: string };
} & JumioVerificationStatusDetails;

// Mirrors the reference backend's SignInWithEmail.tsx handleVerifyEmail: this
// single backend endpoint is overloaded - if the response already carries a
// usable accessToken, the email is already verified/known and the client
// should skip the OTP-entry screen entirely and sign straight in (same as a
// completed sign-in, including the seeded Jumio stage); otherwise the
// backend has sent a one-time code to that address and the client shows the
// code form next.
export async function POST(request: NextRequest) {
  try {
    const origin = getRequestOrigin(request);
    const { email, clientSignature, quickBuyKey } = await request.json();
    if (!email || !clientSignature) {
      return NextResponse.json(
        { ok: false, error: "email and clientSignature are required." },
        { status: 400 }
      );
    }

    const res = await checkoutApiRequest<VerifyEmailDetails>(checkoutEndpoints.verifyEmail, {
      origin,
      widgetKey: quickBuyKey,
      body: { emailAddress: email, EmailAddress: email, clientSignature },
    });

    if (res.status !== "1") {
      return NextResponse.json({ ok: false, ...describeApiFailure(res) }, { status: 502 });
    }

    if (res.details?.accessToken) {
      const verificationStatus = res.details.verificationStatus ?? "NotVerified";
      return NextResponse.json({
        ok: true,
        alreadyVerified: true,
        accessToken: res.details.accessToken,
        verified: verificationStatus === "Verified",
        verificationStatus,
        jumioStatus: normalizeVerificationStatus(res.details),
        encryption: res.details.encryption ?? null,
      });
    }

    return NextResponse.json({
      ok: true,
      alreadyVerified: false,
      termsHtml: res.details?.termsAndConditions ? sanitizeTermsHtml(res.details.termsAndConditions) : null,
    });
  } catch (err) {
    const status = err instanceof CheckoutConfigError ? 500 : 502;
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Couldn't verify that email address." },
      { status }
    );
  }
}
