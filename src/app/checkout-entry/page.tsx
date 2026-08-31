import type { Metadata } from "next";
import { CheckoutEntry } from "@/components/checkout-widget/checkout-entry";

export const metadata: Metadata = {
  title: "Checkout | Peptide Rails",
};

type SearchParams = { [key: string]: string | string[] | undefined };

// The first-loaded "app" page peptiva's real system links/redirects to,
// carrying order params (orderId, amount, currency, returnUrl,
// checkoutToken, ...). It forwards every param straight through to the
// /checkout-widget route, rendered inside an iframe.
export default async function CheckoutEntryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const v = Array.isArray(value) ? value[0] : value;
    if (v) qs.set(key, v);
  }

  return <CheckoutEntry iframeSrc={`/checkout-widget?${qs.toString()}`} />;
}
