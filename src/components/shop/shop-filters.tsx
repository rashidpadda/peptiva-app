"use client";

import { categories, concerns } from "@/data/categories";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";
import type { ProductCategory, SkinConcern } from "@/lib/types";
import type { ShopFilterState } from "@/components/shop/use-shop-filters";

export function ShopFilters({
  filters,
  setFilters,
  maxPrice,
  onClear,
}: {
  filters: ShopFilterState;
  setFilters: (updater: (prev: ShopFilterState) => ShopFilterState) => void;
  maxPrice: number;
  onClear: () => void;
}) {
  function toggleCategory(value: ProductCategory) {
    setFilters((prev) => {
      const set = new Set(prev.categories);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...prev, categories: Array.from(set) };
    });
  }

  function toggleConcern(value: SkinConcern) {
    setFilters((prev) => {
      const set = new Set(prev.concerns);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...prev, concerns: Array.from(set) };
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="font-serif text-lg text-charcoal">Filters</p>
        <button onClick={onClear} className="text-xs text-stone-500 underline underline-offset-4 hover:text-charcoal">
          Clear all
        </button>
      </div>

      <div>
        <label className="flex items-center gap-3">
          <Checkbox
            checked={filters.bestsellerOnly}
            onCheckedChange={(v) => setFilters((prev) => ({ ...prev, bestsellerOnly: !!v }))}
          />
          <span className="text-sm text-stone-700">Best Sellers</span>
        </label>
        <label className="mt-3 flex items-center gap-3">
          <Checkbox
            checked={filters.newOnly}
            onCheckedChange={(v) => setFilters((prev) => ({ ...prev, newOnly: !!v }))}
          />
          <span className="text-sm text-stone-700">New Arrivals</span>
        </label>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Category</p>
        <div className="mt-3 space-y-3">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-3">
              <Checkbox
                checked={filters.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <span className="text-sm text-stone-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Skin Concern</p>
        <div className="mt-3 space-y-3">
          {concerns.map((concern) => (
            <label key={concern.name} className="flex items-center gap-3">
              <Checkbox
                checked={filters.concerns.includes(concern.name)}
                onCheckedChange={() => toggleConcern(concern.name)}
              />
              <span className="text-sm text-stone-700">{concern.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Price</p>
          <span className="text-xs text-stone-500">
            {formatCurrency(filters.priceRange[0])} – {formatCurrency(filters.priceRange[1])}
          </span>
        </div>
        <Slider
          className="mt-4"
          min={0}
          max={maxPrice}
          step={1}
          value={filters.priceRange}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, priceRange: value as [number, number] }))
          }
        />
      </div>
    </div>
  );
}
