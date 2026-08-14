"use client";

import { useState } from "react";
import Link from "next/link";
import type { Address, Order, OrderItem } from "@/lib/types";
import { generateOrderId } from "@/lib/utils";
import { demoCustomer } from "@/data/customer";
import { getProductById } from "@/data/products";
import {
  useCartStore,
  activeCartItems,
  getSubtotal,
  getShipping,
  getTax,
  getDiscount,
  getTotal,
} from "@/store/cart";
import { useOrdersStore } from "@/store/orders";
import { useAddressesStore } from "@/store/addresses";
import { QuickBuyShell } from "@/components/quick-buy/widget-shell";
import { ProductsStep } from "@/components/quick-buy/steps/products-step";
import { CartStep } from "@/components/quick-buy/steps/cart-step";
import { ShippingStep } from "@/components/quick-buy/steps/shipping-step";
import { IdentityStep } from "@/components/quick-buy/steps/identity-step";
import { PaymentStep, type CardDetails } from "@/components/quick-buy/steps/payment-step";
import { QuickBuySuccess } from "@/components/quick-buy/success-screen";

const TOTAL_STEPS = 5;
const DECLINE_TEST_CARD = "4000000000000002";

const EMPTY_ADDRESS: Address = {
  firstName: demoCustomer.firstName,
  lastName: demoCustomer.lastName,
  address1: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
};

export function QuickBuyWidget() {
  const [step, setStep] = useState(1);
  const [order, setOrder] = useState<Order | null>(null);

  const items = useCartStore((s) => s.items);
  const promoCode = useCartStore((s) => s.promoCode);
  const shippingMethod = useCartStore((s) => s.shippingMethod);
  const clearCart = useCartStore((s) => s.clearCart);
  const addOrder = useOrdersStore((s) => s.addOrder);
  const addresses = useAddressesStore((s) => s.addresses);

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [address, setAddress] = useState<Address>(() =>
    defaultAddress
      ? {
          firstName: defaultAddress.firstName,
          lastName: defaultAddress.lastName,
          address1: defaultAddress.address1,
          city: defaultAddress.city,
          state: defaultAddress.state,
          zip: defaultAddress.zip,
          country: defaultAddress.country,
        }
      : EMPTY_ADDRESS
  );
  const [phone, setPhone] = useState(demoCustomer.phone);

  const active = activeCartItems(items);
  const subtotal = getSubtotal(items);
  const discount = getDiscount(subtotal, promoCode);
  const shipping = getShipping(subtotal, shippingMethod);
  const tax = getTax(subtotal, discount);
  const total = getTotal(subtotal, shipping, tax, discount);

  // PaymentStep owns the processing/verifying/approved pacing and calls this
  // synchronously once it's ready to know the result - building the order
  // here without committing it to the stores yet means PaymentStep can show
  // its "Payment approved" beat before this component swaps to the full
  // success screen, instead of racing that state update.
  function attemptPayment(card: CardDetails): Order | null {
    if (card.cardNumber.replace(/\D/g, "") === DECLINE_TEST_CARD) {
      return null;
    }

    const orderItems: OrderItem[] = active
      .map((item) => {
        const product = getProductById(item.productId);
        if (!product) return null;
        return {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          quantity: item.quantity,
        } satisfies OrderItem;
      })
      .filter((i): i is OrderItem => i !== null);

    return {
      id: generateOrderId(),
      date: new Date().toISOString(),
      customer: {
        firstName: demoCustomer.firstName,
        lastName: demoCustomer.lastName,
        email: demoCustomer.email,
        phone,
        subscribe: false,
      },
      shippingAddress: address,
      shippingMethod,
      paymentMethod: "card",
      items: orderItems,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      status: "processing",
    };
  }

  function handlePaymentSuccess(newOrder: Order) {
    addOrder(newOrder);
    clearCart();
    setOrder(newOrder);
  }

  function handleContinueShopping() {
    setOrder(null);
    setStep(1);
  }

  if (order) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:py-20">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="font-serif text-lg tracking-wide text-charcoal/70 transition-colors hover:text-charcoal"
          >
            PEPTIVA
          </Link>
        </div>
        <div className="rounded-3xl border border-border-soft bg-cream p-6 shadow-xl shadow-charcoal/5 sm:p-8">
          <QuickBuySuccess order={order} onContinueShopping={handleContinueShopping} />
        </div>
      </div>
    );
  }

  return (
    <QuickBuyShell step={step} total={TOTAL_STEPS} onBack={step > 1 ? () => setStep((s) => s - 1) : undefined}>
      {step === 1 && <ProductsStep onContinue={() => setStep(2)} />}
      {step === 2 && <CartStep onContinue={() => setStep(3)} />}
      {step === 3 && (
        <ShippingStep
          initialAddress={address}
          initialPhone={phone}
          onContinue={(value, phoneValue) => {
            setAddress(value);
            setPhone(phoneValue);
            setStep(4);
          }}
        />
      )}
      {step === 4 && <IdentityStep onContinue={() => setStep(5)} />}
      {step === 5 && (
        <PaymentStep
          total={total}
          address={address}
          phone={phone}
          onAttemptPayment={attemptPayment}
          onSuccess={handlePaymentSuccess}
          onEditAddress={() => setStep(3)}
        />
      )}
    </QuickBuyShell>
  );
}
