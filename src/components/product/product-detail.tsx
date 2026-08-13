"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { RatingStars } from "@/components/product/rating-stars";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { getReviewsForProduct } from "@/data/reviews";
import { formatDate } from "@/lib/utils";

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const productReviews = getReviewsForProduct(product.id);
  const inStock = product.stock > 0;

  function handleAddToCart() {
    addItem(product.id, quantity);
    toast.success("Added to your bag", { description: product.name });
  }

  function handleBuyNow() {
    addItem(product.id, quantity);
    router.push("/checkout");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery product={product} />

        <div>
          <span className="text-[11px] uppercase tracking-wider text-stone-500">
            {product.category}
          </span>
          <h1 className="mt-1 font-serif text-3xl text-charcoal sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2">
            <RatingStars rating={product.rating} />
            <span className="text-sm text-stone-500">
              {product.rating} · {product.reviewCount} reviews
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-medium text-charcoal">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-stone-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-stone-600">{product.shortDescription}</p>

          <p className="mt-3 text-xs text-stone-500">{product.size}</p>

          <div className="mt-4 flex items-center gap-2 text-xs">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                inStock ? "bg-sage" : "bg-stone-300"
              )}
            />
            <span className={inStock ? "text-sage-dark" : "text-stone-400"}>
              {inStock ? `In stock — ${product.stock} available` : "Out of stock"}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
            <Truck className="h-3.5 w-3.5" />
            Free shipping on orders over $75
          </div>

          <div className="mt-6 flex items-center gap-1 w-fit rounded-full border border-stone-300">
            <button
              className="flex h-11 w-11 items-center justify-center text-stone-600 disabled:opacity-30"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm">{quantity}</span>
            <button
              className="flex h-11 w-11 items-center justify-center text-stone-600"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 hidden gap-3 sm:flex">
            <Button size="lg" className="flex-1" disabled={!inStock} onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button size="lg" variant="secondary" className="flex-1" disabled={!inStock} onClick={handleBuyNow}>
              Buy Now
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-14 w-14 shrink-0"
              onClick={() => toggleFavorite(product.id)}
              aria-label="Toggle favorite"
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500 text-red-500")} />
            </Button>
          </div>

          <div className="mt-12">
            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="how-to-use">How to Use</TabsTrigger>
                <TabsTrigger value="science">Peptide Science</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({productReviews.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="description">{product.description}</TabsContent>

              <TabsContent value="benefits">
                <p className="mb-3 font-medium text-charcoal">Why you&apos;ll love it</p>
                <ul className="space-y-2">
                  {product.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sage" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="ingredients">
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {product.ingredients.map((ingredient) => (
                    <li key={ingredient} className="rounded-lg bg-beige px-3 py-2 text-stone-700">
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="how-to-use">{product.howToUse}</TabsContent>

              <TabsContent value="science">{product.peptideScience}</TabsContent>

              <TabsContent value="reviews">
                {productReviews.length === 0 ? (
                  <p>No reviews yet for this product.</p>
                ) : (
                  <div className="space-y-6">
                    {productReviews.map((review) => (
                      <div key={review.id} className="border-b border-border-soft pb-6 last:border-0">
                        <div className="flex items-center justify-between">
                          <RatingStars rating={review.rating} />
                          <span className="text-xs text-stone-400">{formatDate(review.date)}</span>
                        </div>
                        <p className="mt-2 font-medium text-charcoal">{review.title}</p>
                        <p className="mt-1 text-stone-600">{review.body}</p>
                        <p className="mt-2 text-xs text-stone-500">
                          {review.author} {review.verified && "· Verified Purchase"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">You May Also Like</h2>
          <div className="mt-8">
            <ProductGrid products={related} />
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border-soft bg-cream p-4 sm:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-charcoal">{product.name}</p>
            <p className="text-sm text-stone-500">{formatCurrency(product.price)}</p>
          </div>
          <Button disabled={!inStock} onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
