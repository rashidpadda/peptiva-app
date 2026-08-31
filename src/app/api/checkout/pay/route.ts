import { NextResponse, type NextRequest } from "next/server";
import { checkoutApiRequest, checkoutEndpoints, describeApiFailure, CheckoutConfigError } from "@/lib/checkoutApi";
import { getRequestOrigin } from "@/lib/requestOrigin";
import type { CardPaymentPayload } from "@/lib/cardEncryption";

type PayDetails = {
  paymentReference?: string;
  redirectUrl?: string;
};

// The card is already PGP-encrypted client-side (src/lib/cardEncryption.ts)
// before it ever reaches this route - `payload` here is the exact,
// confirmed-working submitnewcardform shape (captured from a real
// successful order on the same backend via deposit-onboarding), passed
// through unmodified. This route's only job is attaching the accessToken/
// origin/widget-key headers a plain client fetch can't set safely.
export async function POST(request: NextRequest) {
  try {
    const origin = getRequestOrigin(request);
    const { accessToken, quickBuyKey, payload } = (await request.json()) as {
      accessToken?: string;
      quickBuyKey?: string;
      payload?: CardPaymentPayload;
    };

    if (!accessToken || !payload) {
      return NextResponse.json({ ok: false, error: "Missing required checkout fields." }, { status: 400 });
    }

    const res = await checkoutApiRequest<PayDetails>(checkoutEndpoints.payWithNewCard, {
      accessToken,
      origin,
      widgetKey: quickBuyKey,
      body: payload,
    });

    if (res.status !== "1") {
      return NextResponse.json({ ok: false, ...describeApiFailure(res) }, { status: 402 });
    }
    if (!res.details?.paymentReference) {
      return NextResponse.json(
        {
          ok: false,
          error: "Payment could not be completed.",
          detail: "Backend returned status \"1\" but no paymentReference",
        },
        { status: 402 }
      );
    }

    return NextResponse.json({
      ok: true,
      paymentReference: res.details.paymentReference,
      redirectUrl: res.details.redirectUrl ?? null,
    });
  } catch (err) {
    const status = err instanceof CheckoutConfigError ? 500 : 502;
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Payment could not be completed." },
      { status }
    );
  }
}
