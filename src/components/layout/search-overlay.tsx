"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, X } from "lucide-react";
import { products } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import { ProductVisual } from "@/components/product/product-visual";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const RECENT_KEY = "peptiva-recent-searches";
const POPULAR = products.filter((p) => p.bestseller).slice(0, 4);

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function SearchOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(() => readRecent());

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  function commitSearch(term: string) {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
    setRecent(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setQuery("");
      }}
    >
      <SheetContent side="top" className="h-[85vh] max-h-[600px] p-0" hideClose>
        <SheetTitle className="sr-only">Search</SheetTitle>
        <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-6 py-8">
          <div className="flex items-center gap-3 border-b border-border-soft pb-4">
            <SearchIcon className="h-5 w-5 text-stone-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) commitSearch(query.trim());
              }}
              placeholder="Search products, concerns, ingredients..."
              className="flex-1 bg-transparent font-serif text-xl text-charcoal placeholder:text-stone-400 focus:outline-none"
            />
            <button
              aria-label="Close search"
              onClick={() => onOpenChange(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 hover:bg-beige"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex-1 overflow-y-auto">
            {query.trim() === "" ? (
              <div className="space-y-8">
                {recent.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">
                      Recent Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recent.map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="rounded-full border border-stone-300 px-4 py-1.5 text-sm text-stone-700 hover:border-charcoal"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">
                    Popular Products
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {POPULAR.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.slug}`}
                        onClick={() => onOpenChange(false)}
                        className="group"
                      >
                        <ProductVisual product={p} className="aspect-square rounded-xl" />
                        <p className="mt-2 line-clamp-1 text-sm text-charcoal group-hover:underline">
                          {p.name}
                        </p>
                        <p className="text-xs text-stone-500">{formatCurrency(p.price)}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <p className="font-serif text-xl text-charcoal">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-sm text-stone-500">
                  Try searching by product name, category or skin concern.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => {
                      commitSearch(query.trim());
                      onOpenChange(false);
                    }}
                    className="group"
                  >
                    <ProductVisual product={p} className="aspect-square rounded-xl" />
                    <p className="mt-2 line-clamp-1 text-sm text-charcoal group-hover:underline">
                      {p.name}
                    </p>
                    <p className="text-xs text-stone-500">{formatCurrency(p.price)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
