"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  Address,
  CardDetails,
  CustomerInfo,
  Order,
  OrderItem,
  PaymentMethod,
  ShippingMethod,
} from "@/lib/types";
import { generateOrderId } from "@/lib/utils";
import { DECLINE_TEST_CARD } from "@/lib/validation";
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
import { Stepper } from "@/components/checkout/stepper";
import { InformationStep } from "@/components/checkout/steps/information-step";
import { ShippingStep } from "@/components/checkout/steps/shipping-step";
import { PaymentStep } from "@/components/checkout/steps/payment-step";
import { ReviewStep } from "@/components/checkout/steps/review-step";
import { PageBrandMark } from "@/components/layout/page-brand-mark";

const EMPTY_CUSTOMER: CustomerInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subscribe: false,
};

const EMPTY_ADDRESS: Address = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
};

export function CheckoutFlow() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const promoCode = useCartStore((s) => s.promoCode);
  const clearCart = useCartStore((s) => s.clearCart);
  const addOrder = useOrdersStore((s) => s.addOrder);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [hasPlacedOrder, setHasPlacedOrder] = useState(false);
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [card, setCard] = useState<CardDetails | null>(null);

  const active = activeCartItems(items);
  const subtotal = getSubtotal(items);
  const discount = getDiscount(subtotal, promoCode);
  const shipping = getShipping(subtotal, shippingMethod);
  const tax = getTax(subtotal, discount);
  const total = getTotal(subtotal, shipping, tax, discount);

  useEffect(() => {
    if (active.length === 0 && step !== 4) {
      router.replace("/cart");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function placeOrder(): Order | null {
    if (paymentMethod === "card" && card?.cardNumber.replace(/\D/g, "") === DECLINE_TEST_CARD) {
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

    const order: Order = {
      id: generateOrderId(),
      date: new Date().toISOString(),
      customer,
      shippingAddress: address,
      shippingMethod,
      paymentMethod,
      items: orderItems,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      status: "processing",
    };

    addOrder(order);
    clearCart();
    setHasPlacedOrder(true);
    return order;
  }

  if (active.length === 0 && !hasPlacedOrder) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <PageBrandMark />
      <Link href="/cart" className="mt-4 inline-block text-sm text-stone-500 hover:text-charcoal">
        &larr; Back to bag
      </Link>
      <h1 className="mt-3 font-serif text-3xl text-charcoal">Checkout</h1>

      <div className="mt-8">
        <Stepper currentStep={step} />
      </div>

      <div className="mt-10">
        {step === 1 && (
          <InformationStep
            initialValue={customer}
            onContinue={(value) => {
              setCustomer(value);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <ShippingStep
            initialAddress={address}
            initialMethod={shippingMethod}
            subtotal={subtotal}
            onBack={() => setStep(1)}
            onContinue={(value, method) => {
              setAddress(value);
              setShippingMethod(method);
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <PaymentStep
            initialMethod={paymentMethod}
            initialCard={card}
            onBack={() => setStep(2)}
            onContinue={(method, cardValue) => {
              setPaymentMethod(method);
              setCard(cardValue);
              setStep(4);
            }}
          />
        )}

        {step === 4 && (
          <ReviewStep
            customer={customer}
            address={address}
            shippingMethod={shippingMethod}
            paymentMethod={paymentMethod}
            card={card}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            discount={discount}
            total={total}
            onBack={() => setStep(3)}
            onEditStep={(s) => setStep(s)}
            onPlaceOrder={placeOrder}
            onSuccess={(order) => router.push(`/order-confirmation/${order.id}`)}
          />
        )}
      </div>
    </div>
  );
}
