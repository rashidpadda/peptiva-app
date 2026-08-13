import type { ProductCategory, SkinConcern } from "@/lib/types";

export type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

export type ShopFilterState = {
  search: string;
  categories: ProductCategory[];
  concerns: SkinConcern[];
  priceRange: [number, number];
  bestsellerOnly: boolean;
  newOnly: boolean;
  sort: SortOption;
};

export function emptyFilters(maxPrice: number): ShopFilterState {
  return {
    search: "",
    categories: [],
    concerns: [],
    priceRange: [0, maxPrice],
    bestsellerOnly: false,
    newOnly: false,
    sort: "featured",
  };
}
