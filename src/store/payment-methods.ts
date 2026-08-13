import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SavedPaymentMethod = {
  id: string;
  brand: "Visa" | "Mastercard" | "Amex";
  last4: string;
  expiry: string;
  isDefault?: boolean;
};

const seedMethods: SavedPaymentMethod[] = [
  { id: "pm-1", brand: "Visa", last4: "4242", expiry: "12/30", isDefault: true },
];

type PaymentMethodsState = {
  methods: SavedPaymentMethod[];
  removeMethod: (id: string) => void;
};

export const usePaymentMethodsStore = create<PaymentMethodsState>()(
  persist(
    (set) => ({
      methods: seedMethods,
      removeMethod: (id) =>
        set((state) => ({ methods: state.methods.filter((m) => m.id !== id) })),
    }),
    { name: "peptiva-payment-methods" }
  )
);
