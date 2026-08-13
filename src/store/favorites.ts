import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoritesState = {
  productIds: string[];
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      productIds: [],
      addFavorite: (productId) =>
        set((state) =>
          state.productIds.includes(productId)
            ? state
            : { productIds: [...state.productIds, productId] }
        ),
      removeFavorite: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),
      toggleFavorite: (productId) => {
        const isFav = get().productIds.includes(productId);
        if (isFav) {
          get().removeFavorite(productId);
        } else {
          get().addFavorite(productId);
        }
      },
      isFavorite: (productId) => get().productIds.includes(productId),
    }),
    { name: "peptiva-favorites" }
  )
);
