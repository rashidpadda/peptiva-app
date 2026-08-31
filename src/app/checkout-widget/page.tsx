import type { Metadata } from "next";
import { CheckoutWidgetShell } from "@/components/checkout-widget/checkout-widget-shell";

export const metadata: Metadata = {
  title: "Checkout | Peptide Rails",
};

type SearchParams = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// The iframe target - reads order info (orderId, amount, currency, and
// optionally email/returnUrl/checkoutToken) straight from its own URL,
// forwarded here by /checkout-entry. peptiva owns order creation and the
// checkoutToken's validity on their side; this page just consumes what it's
// given and runs the real verify -> [KYC] -> pay flow against it.
export default async function CheckoutWidgetPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const orderId = first(params.orderId);
  const currency = first(params.currency);
  const amountRaw = first(params.amount);
  const amount = amountRaw ? Number(amountRaw) : NaN;

  if (!orderId || !currency || !Number.isFinite(amount) || amount <= 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-lg items-center justify-center px-4 text-center">
        <p className="text-sm text-stone-500">
          This checkout link is missing required order information.
        </p>
      </div>
    );
  }

  return (
    <CheckoutWidgetShell
      order={{
        orderId,
        amount,
        currency,
        email: first(params.email),
        returnUrl: first(params.returnUrl),
        checkoutToken: first(params.checkoutToken),
        quickBuyKey: first(params.quickBuyKey),
      }}
    />
  );
}
