import { featuredTestimonials } from "@/data/reviews";
import { getProductById } from "@/data/products";
import { RatingStars } from "@/components/product/rating-stars";

export function ReviewsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">
          Loved by Thousands
        </p>
        <h2 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">Customer Reviews</h2>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredTestimonials.map((review) => {
          const product = getProductById(review.productId);
          return (
            <div
              key={review.id}
              className="flex flex-col rounded-2xl border border-border-soft bg-cream p-6"
            >
              <RatingStars rating={review.rating} />
              <p className="mt-3 font-serif text-base text-charcoal">{review.title}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
                &ldquo;{review.body}&rdquo;
              </p>
              <div className="mt-4 border-t border-border-soft pt-3">
                <p className="text-sm font-medium text-charcoal">{review.author}</p>
                {product && <p className="text-xs text-stone-500">{product.name}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
