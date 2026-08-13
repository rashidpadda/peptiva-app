"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Search } from "lucide-react";
import { products } from "@/data/products";
import type { Product, ProductCategory, SkinConcern } from "@/lib/types";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-grid";
import { ShopFilters } from "@/components/shop/shop-filters";
import { emptyFilters, type ShopFilterState, type SortOption } from "@/components/shop/use-shop-filters";

const MAX_PRICE = Math.max(...products.map((p) => p.price));

function sortProducts(items: Product[], sort: SortOption): Product[] {
  const copy = [...items];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copy.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export function ShopClient() {
  const searchParams = useSearchParams();
  const initial = useMemo(() => {
    const base = emptyFilters(MAX_PRICE);
    const category = searchParams.get("category") as ProductCategory | null;
    const concern = searchParams.get("concern") as SkinConcern | null;
    const filter = searchParams.get("filter");
    const search = searchParams.get("q");
    return {
      ...base,
      categories: category ? [category] : [],
      concerns: concern ? [concern] : [],
      bestsellerOnly: filter === "bestseller",
      newOnly: filter === "new",
      search: search ?? "",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [filters, setFilters] = useState<ShopFilterState>(initial);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const result = products.filter((p) => {
      if (q && !(p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)))) {
        return false;
      }
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.concerns.length && !p.concerns.some((c) => filters.concerns.includes(c))) return false;
      if (filters.bestsellerOnly && !p.bestseller) return false;
      if (filters.newOnly && !p.newArrival) return false;
      if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;
      return true;
    });
    return sortProducts(result, filters.sort);
  }, [filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">Shop All</p>
        <h1 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">Peptide Skincare</h1>
        <p className="mt-2 max-w-lg text-sm text-stone-500">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search products..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
          <Select
            value={filters.sort}
            onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value as SortOption }))}
            className="w-44"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Best Rated</option>
            <option value="newest">Newest</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <ShopFilters
            filters={filters}
            setFilters={setFilters}
            maxPrice={MAX_PRICE}
            onClear={() => setFilters(emptyFilters(MAX_PRICE))}
          />
        </aside>

        <ProductGrid products={filtered} />
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="p-6">
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
          </div>
          <div className="mt-6 flex-1 overflow-y-auto">
            <ShopFilters
              filters={filters}
              setFilters={setFilters}
              maxPrice={MAX_PRICE}
              onClear={() => setFilters(emptyFilters(MAX_PRICE))}
            />
          </div>
          <Button className="mt-6" onClick={() => setMobileFiltersOpen(false)}>
            Show {filtered.length} Results
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
