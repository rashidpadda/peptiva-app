import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/lib/types";

const seedOrders: Order[] = [
  {
    id: "PEP-20260622-483911",
    date: "2026-06-22",
    customer: {
      firstName: "Jordan",
      lastName: "Ellis",
      email: "jordan.ellis@example.com",
      phone: "(555) 019-2244",
      subscribe: true,
    },
    shippingAddress: {
      firstName: "Jordan",
      lastName: "Ellis",
      address1: "482 Ivory Lane",
      city: "Austin",
      state: "TX",
      zip: "78701",
      country: "United States",
    },
    shippingMethod: "standard",
    paymentMethod: "card",
    items: [
      {
        productId: "1",
        name: "Peptide Renewal Serum",
        slug: "peptide-renewal-serum",
        price: 68,
        quantity: 1,
      },
      {
        productId: "9",
        name: "Peptide Lip Repair Balm",
        slug: "peptide-lip-repair-balm",
        price: 24,
        quantity: 2,
      },
    ],
    subtotal: 116,
    shipping: 0,
    tax: 9.57,
    discount: 0,
    total: 125.57,
    status: "delivered",
  },
  {
    id: "PEP-20260714-291007",
    date: "2026-07-14",
    customer: {
      firstName: "Jordan",
      lastName: "Ellis",
      email: "jordan.ellis@example.com",
      phone: "(555) 019-2244",
      subscribe: true,
    },
    shippingAddress: {
      firstName: "Jordan",
      lastName: "Ellis",
      address1: "482 Ivory Lane",
      city: "Austin",
      state: "TX",
      zip: "78701",
      country: "United States",
    },
    shippingMethod: "express",
    paymentMethod: "paypal",
    items: [
      {
        productId: "10",
        name: "Peptide Essentials Set",
        slug: "peptide-essentials-set",
        price: 129,
        quantity: 1,
      },
    ],
    subtotal: 129,
    shipping: 12,
    tax: 10.64,
    discount: 12.9,
    total: 138.74,
    status: "shipped",
  },
];

type OrdersState = {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrder: (id: string) => Order | undefined;
};

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: seedOrders,
      addOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders] })),
      getOrder: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: "peptiva-orders" }
  )
);
