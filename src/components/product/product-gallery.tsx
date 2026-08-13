"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { ProductVisual } from "@/components/product/product-visual";

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const views = ["Front", "Detail", "Texture"];

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl border border-border-soft">
        <ProductVisual
          product={product}
          className={cn(
            "h-full w-full transition-transform duration-500",
            active === 1 && "scale-125",
            active === 2 && "scale-110 -rotate-2"
          )}
        />
      </div>
      <div className="mt-4 flex gap-3">
        {views.map((view, i) => (
          <button
            key={view}
            onClick={() => setActive(i)}
            className={cn(
              "h-20 w-20 overflow-hidden rounded-xl border transition-colors",
              active === i ? "border-charcoal" : "border-border-soft"
            )}
            aria-label={`View ${view}`}
          >
            <ProductVisual
              product={product}
              className={cn(
                "h-full w-full",
                i === 1 && "scale-125",
                i === 2 && "scale-110 -rotate-2"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
