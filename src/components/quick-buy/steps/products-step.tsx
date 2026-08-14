"use client";

import { useMemo, useState } from "react";
import { Check, Minus, Plus, Search, ShoppingBag } from "lucide-react";
import { products } from "@/data/products";
import type { Product } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore, activeCartItems, getItemCount, getSubtotal } from "@/store/cart";
import { ProductVisual } from "@/components/product/product-visual";
import { RatingStars } from "@/components/product/rating-stars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type SortOption = "featured" | "price-asc" | "price-desc" | "rating";

function sortProducts(list: Product[], sort: SortOption): Product[] {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export function ProductsStep({ onContinue }: { onContinue: () => void }) {
  const items = useCartStore((s) => s.items);
  const addItemToCart = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const closeDrawer = useCartStore((s) => s.closeDrawer);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");

  const active = activeCartItems(items);
  const count = getItemCount(items);
  const subtotal = getSubtotal(items);

  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        )
      : products;
    return sortProducts(filtered, sort);
  }, [search, sort]);

  function quantityFor(productId: string) {
    return active.find((i) => i.productId === productId)?.quantity ?? 0;
  }

  // The global cart store opens the site-wide drawer on every addItem() call
  // (see store/cart.ts) - inside this self-contained widget that drawer would
  // slide over the flow, so every add here immediately closes it again.
  function addItem(productId: string, quantity: number) {
    addItemToCart(productId, quantity);
    closeDrawer();
  }

  return (
    <div>
      <p className="mb-4 text-sm text-stone-500">
        Add the peptide formulas you&apos;d like to try, then continue when you&apos;re ready.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="h-10 pl-10"
          />
        </div>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="h-10 sm:w-52"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Best Rated</option>
        </Select>
      </div>

      <div className="relative mt-4">
        {visibleProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-12 text-center">
            <p className="text-sm text-charcoal">No products found</p>
            <p className="text-xs text-stone-500">Try a different search term.</p>
          </div>
        ) : (
          <>
            <div className="grid max-h-[460px] grid-cols-2 gap-4 overflow-y-auto pb-2 pr-1 sm:grid-cols-3">
              {visibleProducts.map((product) => {
                const quantity = quantityFor(product.id);
                const added = quantity > 0;
                return (
                  <div
                    key={product.id}
                    className={cn(
                      "relative flex flex-col rounded-2xl border bg-ivory p-3 transition-colors",
                      added ? "border-sage/70 bg-sage/5" : "border-border-soft"
                    )}
                  >
                    {added && (
                      <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-sage text-white shadow-sm">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}

                    <ProductVisual product={product} className="aspect-square rounded-xl" />

                    <span className="mt-3 text-[10px] font-medium uppercase tracking-wider text-stone-400">
                      {product.category}
                    </span>
                    <p className="mt-0.5 line-clamp-2 min-h-[2.4rem] text-sm leading-tight text-charcoal">
                      {product.name}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <RatingStars rating={product.rating} size={11} />
                      <span className="text-[11px] text-stone-400">({product.reviewCount})</span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-charcoal">
                      {formatCurrency(product.price)}
                    </p>

                    {quantity === 0 ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-3 h-9 w-full"
                        onClick={() => addItem(product.id, 1)}
                      >
                        Add
                      </Button>
                    ) : (
                      <div className="mt-3 flex h-9 items-center justify-between rounded-full border border-sage/60 bg-white">
                        <button
                          className="flex h-9 w-9 items-center justify-center text-stone-600"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-medium text-charcoal">{quantity}</span>
                        <button
                          className="flex h-9 w-9 items-center justify-center text-stone-600"
                          onClick={() => addItem(product.id, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-xl bg-gradient-to-t from-cream to-transparent" />
          </>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border-soft pt-5">
        <span className="flex items-center gap-2 text-sm text-stone-600">
          <ShoppingBag className="h-4 w-4" />
          {count === 0 ? (
            "Your bag is empty"
          ) : (
            <>
              {count} item{count !== 1 ? "s" : ""} · {formatCurrency(subtotal)}
            </>
          )}
        </span>
        <Button onClick={onContinue} disabled={count === 0}>
          Continue to Bag
        </Button>
      </div>
    </div>
  );
}
