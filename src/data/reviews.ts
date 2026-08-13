import type { Review } from "@/lib/types";

export const reviews: Review[] = [
  {
    id: "r1",
    productId: "1",
    author: "Jenna M.",
    rating: 5,
    title: "Holy grail serum",
    body: "I've tried a lot of peptide serums and this is the one that actually made a visible difference in how firm my skin looks. Layers beautifully under my moisturizer and doesn't pill.",
    date: "2026-06-02",
    verified: true,
  },
  {
    id: "r2",
    productId: "1",
    author: "Priya R.",
    rating: 5,
    title: "Lightweight but effective",
    body: "Absorbs so fast and my skin looks noticeably smoother after about three weeks of daily use. Will be repurchasing.",
    date: "2026-05-14",
    verified: true,
  },
  {
    id: "r3",
    productId: "1",
    author: "Claire D.",
    rating: 4,
    title: "Great texture",
    body: "Love the feel of this one. Took a little longer than I expected to notice results but I'm happy overall.",
    date: "2026-04-28",
    verified: true,
  },
  {
    id: "r4",
    productId: "2",
    author: "Michael T.",
    rating: 5,
    title: "Rich without being heavy",
    body: "Finally a moisturizer that feels luxurious but doesn't sit on top of my skin. My skin looks so much more resilient.",
    date: "2026-05-30",
    verified: true,
  },
  {
    id: "r5",
    productId: "2",
    author: "Sofia L.",
    rating: 4,
    title: "Lovely daily cream",
    body: "Great for layering over the serum. A little goes a long way.",
    date: "2026-03-19",
    verified: false,
  },
  {
    id: "r6",
    productId: "4",
    author: "Amanda K.",
    rating: 5,
    title: "Under-eyes look so refreshed",
    body: "The cooling applicator is genius when I've had a bad night's sleep. My under-eye area looks visibly brighter.",
    date: "2026-06-10",
    verified: true,
  },
  {
    id: "r7",
    productId: "8",
    author: "Rachel B.",
    rating: 5,
    title: "Worth the investment",
    body: "This is the treatment I reach for every night. My skin has never looked this firm and smooth.",
    date: "2026-05-22",
    verified: true,
  },
  {
    id: "r8",
    productId: "10",
    author: "Olivia S.",
    rating: 5,
    title: "Perfect starter set",
    body: "Gifted this to my sister and she loved it. Great way to try the whole peptide routine without committing to full sizes.",
    date: "2026-04-11",
    verified: true,
  },
];

export function getReviewsForProduct(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}

export const featuredTestimonials: Review[] = [
  reviews[0],
  reviews[3],
  reviews[5],
  reviews[6],
];
