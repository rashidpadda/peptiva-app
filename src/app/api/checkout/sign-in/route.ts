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

type SignInDetails = {
  accessToken?: string;
  verificationStatus?: string;
  encryption?: { keyId: string; publicKey: string };
} & JumioVerificationStatusDetails;

// verified === true means the customer is already fully KYC-verified and
// the widget should skip the Jumio step entirely, going straight to
// payment - same VERIFICATION_STATUS.Verified semantics the reference backend
// uses in SignInWithEmail.tsx's handleSignin. Otherwise, the response also
// seeds the initial Jumio stage/iframeUrl (jumioStatus below) exactly like
// the reference backend does, so the identity step can resume from wherever the
// backend says this customer's verification actually is.
export async function POST(request: NextRequest) {
  try {
    const origin = getRequestOrigin(request);
    const { email, verificationCode, clientSignature, acceptedTerms, quickBuyKey } = await request.json();
    if (!email || !verificationCode || !clientSignature) {
      return NextResponse.json(
        { ok: false, error: "email, verificationCode, and clientSignature are required." },
        { status: 400 }
      );
    }
    if (!acceptedTerms) {
      return NextResponse.json(
        { ok: false, error: "You must accept the terms to continue." },
        { status: 400 }
      );
    }

    // Payload shape confirmed against the real gateway via
    // deposit-onboarding's proven working integration
    // (src/lib/quickbuyPayloads.ts buildSignInPayload) - bTermsAndConditions
    // records this customer's actual consent, not just a hardcoded true.
    const res = await checkoutApiRequest<SignInDetails>(checkoutEndpoints.signIn, {
      origin,
      widgetKey: quickBuyKey,
      body: {
        emailAddress: email,
        EmailAddress: email,
        verificationCode,
        isEmailVerified: true,
        bTermsAndConditions: Boolean(acceptedTerms),
        bEmailNotifications: false,
        emailFromAddress: null,
        clientSignature,
      },
    });

    if (res.status !== "1") {
      return NextResponse.json({ ok: false, ...describeApiFailure(res) }, { status: 403 });
    }

    const accessToken = res.details?.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { ok: false, error: "Couldn't sign you in, please check the verification code." },
        { status: 403 }
      );
    }

    const verificationStatus = res.details?.verificationStatus ?? "NotVerified";
    const jumioStatus = normalizeVerificationStatus(res.details);

    return NextResponse.json({
      ok: true,
      accessToken,
      verified: verificationStatus === "Verified",
      verificationStatus,
      jumioStatus,
      encryption: res.details?.encryption ?? null,
    });
  } catch (err) {
    const status = err instanceof CheckoutConfigError ? 500 : 502;
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Couldn't sign you in." },
      { status }
    );
  }
}
