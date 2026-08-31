import { NextResponse, type NextRequest } from "next/server";
import { checkoutApiRequest, checkoutEndpoints, describeApiFailure } from "@/lib/checkoutApi";
import { getRequestOrigin } from "@/lib/requestOrigin";

export type CoolOffInfo = {
  bCoolOffConfigured: boolean;
  bInCoolOff: boolean;
  verificationDate: string | null;
  coolOffEndDate: string | null;
  coolOffTimeRemainingMinutes: number;
  maxOrderAmountUSD: number | null;
  maxOrdersInCoolOff: number | null;
  completedOrdersInWindow: number;
  remainingOrders: number;
};

// Mirrors the reference backend's CheckOut.tsx cool-off fetch (GET
// cooloff-info, fired on reaching order confirmation) - lets the payment
// step warn about account-level order limits before the customer fills in
// card details, instead of only finding out from a rejected payment.
export async function POST(request: NextRequest) {
  try {
    const origin = getRequestOrigin(request);
    const { accessToken, quickBuyKey } = await request.json();
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "Missing accessToken." }, { status: 400 });
    }

    const res = await checkoutApiRequest<CoolOffInfo>(checkoutEndpoints.coolOffInfo, {
      method: "GET",
      accessToken,
      origin,
      widgetKey: quickBuyKey,
    });

    if (res.status !== "1") {
      // Non-fatal by design - a cool-off check that fails to load shouldn't
      // block checkout, just means no proactive warning is shown.
      return NextResponse.json({ ok: true, coolOffInfo: null, note: describeApiFailure(res).detail });
    }

    return NextResponse.json({ ok: true, coolOffInfo: res.details ?? null });
  } catch (err) {
    // Advisory-only endpoint - any failure (including misconfiguration)
    // just means no proactive warning is shown, never a blocked checkout.
    return NextResponse.json({
      ok: true,
      coolOffInfo: null,
      note: err instanceof Error ? err.message : "Cool-off check unavailable.",
    });
  }
}
