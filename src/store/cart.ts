import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProductById } from "@/data/products";
import type { CartItem } from "@/lib/types";

const FREE_SHIPPING_THRESHOLD = 75;
const EXPRESS_SHIPPING_COST = 12;
const TAX_RATE = 0.0825;

const PROMO_CODES: Record<string, number> = {
  PEPTIDE10: 0.1,
};

type ShippingMethod = "standard" | "express";

type CartState = {
  items: CartItem[];
  promoCode: string | null;
  isDrawerOpen: boolean;
  lastAdded: string | null;
  shippingMethod: ShippingMethod;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  setShippingMethod: (method: ShippingMethod) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      promoCode: null,
      isDrawerOpen: false,
      lastAdded: null,
      shippingMethod: "standard",

      addItem: (productId, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === productId && !i.savedForLater
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId && !i.savedForLater
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
              lastAdded: productId,
              isDrawerOpen: true,
            };
          }
          return {
            items: [...state.items, { productId, quantity }],
            lastAdded: productId,
            isDrawerOpen: true,
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], promoCode: null }),

      saveForLater: (productId) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, savedForLater: true } : i
          ),
        }));
      },

      moveToCart: (productId) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, savedForLater: false } : i
          ),
        }));
      },

      applyPromoCode: (code) => {
        const normalized = code.trim().toUpperCase();
        if (PROMO_CODES[normalized]) {
          set({ promoCode: normalized });
          return true;
        }
        return false;
      },

      removePromoCode: () => set({ promoCode: null }),

      setShippingMethod: (method) => set({ shippingMethod: method }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    {
      name: "peptiva-cart",
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        shippingMethod: state.shippingMethod,
      }),
    }
  )
);

export function activeCartItems(items: CartItem[]) {
  return items.filter((i) => !i.savedForLater);
}

export function savedCartItems(items: CartItem[]) {
  return items.filter((i) => i.savedForLater);
}

export function getSubtotal(items: CartItem[]): number {
  return activeCartItems(items).reduce((sum, item) => {
    const product = getProductById(item.productId);
    if (!product) return sum;
    return sum + product.price * item.quantity;
  }, 0);
}

export function getItemCount(items: CartItem[]): number {
  return activeCartItems(items).reduce((sum, item) => sum + item.quantity, 0);
}

export function getDiscount(subtotal: number, promoCode: string | null): number {
  if (!promoCode || !PROMO_CODES[promoCode]) return 0;
  return Math.round(subtotal * PROMO_CODES[promoCode] * 100) / 100;
}

export function getShipping(
  subtotal: number,
  shippingMethod: ShippingMethod
): number {
  if (shippingMethod === "express") return EXPRESS_SHIPPING_COST;
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 6.95;
}

export function getTax(subtotal: number, discount: number): number {
  return Math.round((subtotal - discount) * TAX_RATE * 100) / 100;
}

export function getTotal(
  subtotal: number,
  shipping: number,
  tax: number,
  discount: number
): number {
  return Math.max(0, subtotal - discount + shipping + tax);
}

export { FREE_SHIPPING_THRESHOLD, EXPRESS_SHIPPING_COST };
