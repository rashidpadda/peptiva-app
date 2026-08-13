import type { Product } from "@/lib/types";

export const products: Product[] = [
  {
    id: "1",
    slug: "peptide-renewal-serum",
    name: "Peptide Renewal Serum",
    shortDescription:
      "Lightweight peptide serum designed to support smoother, firmer-looking skin.",
    description:
      "Our signature serum layers a multi-peptide complex with lightweight humectants to support the appearance of smoother, firmer, more resilient-looking skin. Formulated to absorb quickly and layer easily beneath moisturizer, it's designed to become the first active step in a daily peptide routine.",
    price: 68,
    category: "Serums",
    concerns: ["Firmness", "Fine Lines"],
    tags: ["Bestseller", "Firming", "Fine Lines"],
    badge: "Bestseller",
    rating: 4.8,
    reviewCount: 214,
    ingredients: [
      "Multi-Peptide Complex",
      "Sodium Hyaluronate",
      "Niacinamide",
      "Panthenol",
      "Squalane",
    ],
    benefits: [
      "Lightweight texture",
      "Layers easily under moisturizer",
      "Designed for daily use",
      "Supports smoother-looking skin",
      "Helps maintain hydrated-looking skin",
    ],
    howToUse:
      "Apply 2-3 drops to clean, dry skin morning and evening. Gently press into face and neck before layering moisturizer.",
    peptideScience:
      "Formulated with a blend of signal and carrier peptides designed to support the skin's natural structural proteins, helping skin look visibly firmer and smoother over time.",
    featured: true,
    bestseller: true,
    stock: 42,
    size: "1 fl oz / 30 mL",
  },
  {
    id: "2",
    slug: "collagen-support-peptide-cream",
    name: "Collagen Support Peptide Cream",
    shortDescription:
      "Rich yet lightweight moisturizer formulated with peptides to support the appearance of resilient, hydrated skin.",
    description:
      "A velvety, fast-absorbing cream that pairs collagen-supporting peptides with ceramides to help reinforce the look of a healthy moisture barrier. Designed to feel rich without weight, it's suited for layering over serums as the final step in a peptide routine.",
    price: 74,
    category: "Moisturizers",
    concerns: ["Firmness", "Hydration"],
    tags: ["Firming", "Hydration"],
    rating: 4.7,
    reviewCount: 178,
    ingredients: [
      "Peptide Complex",
      "Ceramide NP",
      "Shea Butter",
      "Glycerin",
      "Vitamin E",
    ],
    benefits: [
      "Rich, cushioned texture",
      "Non-greasy finish",
      "Supports barrier resilience",
      "Suitable for daily AM/PM use",
    ],
    howToUse:
      "Warm a pea-sized amount between fingertips and press evenly over face and neck as the last step of your routine.",
    peptideScience:
      "Includes tripeptide and tetrapeptide ingredients commonly studied for their role in supporting the skin's structural framework, formulated here to support a firmer-looking complexion.",
    bestseller: true,
    stock: 37,
    size: "1.7 fl oz / 50 mL",
  },
  {
    id: "3",
    slug: "barrier-restore-peptide-essence",
    name: "Barrier Restore Peptide Essence",
    shortDescription:
      "Hydrating essence designed to replenish moisture and support a healthy-looking skin barrier.",
    description:
      "A featherweight, water-based essence formulated to deliver an immediate surge of hydration while supporting the look of a resilient, healthy skin barrier. Ideal as the first hydrating layer after cleansing.",
    price: 46,
    category: "Essences",
    concerns: ["Barrier Support", "Hydration"],
    tags: ["Hydration", "Barrier Support"],
    rating: 4.6,
    reviewCount: 96,
    ingredients: [
      "Peptide Blend",
      "Beta-Glucan",
      "Sodium PCA",
      "Centella Asiatica Extract",
    ],
    benefits: [
      "Instantly hydrating",
      "Lightweight, watery texture",
      "Preps skin for serum",
      "Supports barrier-looking resilience",
    ],
    howToUse:
      "Pat 3-4 drops into skin with clean hands immediately after cleansing, before serum.",
    peptideScience:
      "A soothing peptide and beta-glucan blend designed to support the skin's moisture reservoir, helping the barrier look calmer and more resilient.",
    stock: 58,
    size: "5 fl oz / 150 mL",
  },
  {
    id: "4",
    slug: "multi-peptide-eye-concentrate",
    name: "Multi-Peptide Eye Concentrate",
    shortDescription:
      "Targeted eye treatment formulated to improve the appearance of tired, delicate skin around the eyes.",
    description:
      "A concentrated, cooling formula built for the eye contour, where skin is thinnest and shows fatigue first. Designed to visibly de-puff and brighten while supporting smoother-looking skin over time.",
    price: 58,
    category: "Eye Care",
    concerns: ["Eye Care", "Fine Lines"],
    tags: ["Eye Care", "Fine Lines"],
    rating: 4.5,
    reviewCount: 132,
    ingredients: [
      "Peptide Complex",
      "Caffeine",
      "Sodium Hyaluronate",
      "Vitamin K",
    ],
    benefits: [
      "Cooling metal applicator",
      "Designed for the delicate eye area",
      "Supports a brighter-looking under-eye",
      "Fragrance-free",
    ],
    howToUse:
      "Glide the applicator gently along the orbital bone morning and evening; pat remaining product with ring finger.",
    peptideScience:
      "A refined peptide concentration formulated at a gentler strength for the eye contour, designed to support smoother, more rested-looking skin.",
    stock: 64,
    size: "0.5 fl oz / 15 mL",
  },
  {
    id: "5",
    slug: "peptide-glow-drops",
    name: "Peptide Glow Drops",
    shortDescription:
      "Lightweight brightening formula designed to leave skin looking fresh, smooth and luminous.",
    description:
      "A luminous, lightweight treatment that blends brightening actives with peptides to support an even, radiant-looking complexion. Can be worn alone or mixed into moisturizer for an all-over glow.",
    price: 52,
    category: "Serums",
    concerns: ["Glow", "Hydration"],
    tags: ["Glow"],
    badge: "New",
    rating: 4.7,
    reviewCount: 61,
    ingredients: [
      "Peptide Complex",
      "Vitamin C Derivative",
      "Niacinamide",
      "Squalane",
    ],
    benefits: [
      "Instant luminous finish",
      "Lightweight, non-sticky",
      "Wears well under makeup",
      "Supports an even-looking tone",
    ],
    howToUse:
      "Press 2-3 drops into skin each morning before moisturizer and SPF.",
    peptideScience:
      "Pairs brightening actives with peptides designed to support the appearance of smoother texture, so skin looks like it's glowing from within.",
    newArrival: true,
    stock: 51,
    size: "1 fl oz / 30 mL",
  },
  {
    id: "6",
    slug: "overnight-peptide-recovery-mask",
    name: "Overnight Peptide Recovery Mask",
    shortDescription:
      "Overnight treatment designed to deeply hydrate and support refreshed-looking skin by morning.",
    description:
      "A rich, sleep-in mask designed to work overnight while skin's natural repair processes are most active. Wake up to a softer, more hydrated-looking complexion without any rinsing required.",
    price: 62,
    category: "Masks",
    concerns: ["Hydration", "Barrier Support"],
    tags: ["Hydration"],
    rating: 4.6,
    reviewCount: 88,
    ingredients: [
      "Peptide Complex",
      "Shea Butter",
      "Squalane",
      "Panthenol",
    ],
    benefits: [
      "No-rinse overnight formula",
      "Deeply cushioning texture",
      "Supports refreshed-looking mornings",
      "Fragrance-free",
    ],
    howToUse:
      "Apply a generous layer as the last step of your evening routine, 2-3 times per week.",
    peptideScience:
      "Formulated to pair peptides with occlusive, skin-conditioning ingredients while skin's overnight recovery window is most active.",
    stock: 29,
    size: "2.5 fl oz / 75 mL",
  },
  {
    id: "7",
    slug: "daily-peptide-moisture-lotion",
    name: "Daily Peptide Moisture Lotion",
    shortDescription:
      "Daily lightweight moisturizer designed for balanced hydration and a soft, smooth skin feel.",
    description:
      "An easy, everyday lotion designed for those who want lightweight hydration without heaviness. Formulated with peptides to support the skin feeling soft, smooth and balanced all day.",
    price: 48,
    category: "Moisturizers",
    concerns: ["Hydration"],
    tags: ["Hydration"],
    rating: 4.5,
    reviewCount: 143,
    ingredients: [
      "Peptide Blend",
      "Glycerin",
      "Aloe Leaf Extract",
      "Vitamin E",
    ],
    benefits: [
      "Fast-absorbing",
      "Non-greasy daily wear",
      "Layers well under SPF",
      "Suitable for all skin types",
    ],
    howToUse:
      "Apply evenly over face and neck each morning as your final hydrating step.",
    peptideScience:
      "A gentle daily peptide concentration designed for everyday wear, supporting balanced-looking hydration without a heavy finish.",
    stock: 71,
    size: "1.7 fl oz / 50 mL",
  },
  {
    id: "8",
    slug: "advanced-peptide-complex",
    name: "Advanced Peptide Complex",
    shortDescription:
      "A concentrated multi-peptide formula designed for a comprehensive anti-aging skincare routine.",
    description:
      "Our most concentrated formula, layering multiple peptide classes designed to work together for a comprehensive approach to visibly firmer, smoother-looking skin. Formulated for those ready to commit to a dedicated peptide routine.",
    price: 89,
    category: "Treatments",
    concerns: ["Firmness", "Fine Lines"],
    tags: ["Firming", "Fine Lines"],
    badge: "Premium",
    rating: 4.9,
    reviewCount: 201,
    ingredients: [
      "Multi-Peptide Complex",
      "Copper Tripeptide",
      "Sodium Hyaluronate",
      "Niacinamide",
    ],
    benefits: [
      "Concentrated multi-peptide formula",
      "Designed for visible firmness",
      "Silky, fast-absorbing texture",
      "Best layered under moisturizer",
    ],
    howToUse:
      "Apply a thin layer to clean skin each evening, following with moisturizer. Introduce gradually if new to peptide treatments.",
    peptideScience:
      "Combines signal, carrier and enzyme-inhibitor peptides in a single concentrated formula for a comprehensive approach to supporting skin's structural framework.",
    featured: true,
    stock: 24,
    size: "1 fl oz / 30 mL",
  },
  {
    id: "9",
    slug: "peptide-lip-repair-balm",
    name: "Peptide Lip Repair Balm",
    shortDescription:
      "Conditioning peptide balm designed to keep lips soft, smooth and hydrated.",
    description:
      "A conditioning, cushiony balm formulated with peptides and nourishing butters to support soft, smooth, hydrated-looking lips. Slips on clear with a subtle satin finish.",
    price: 24,
    category: "Lip Care",
    concerns: ["Hydration"],
    tags: ["Hydration"],
    rating: 4.8,
    reviewCount: 167,
    ingredients: ["Peptide Blend", "Shea Butter", "Squalane", "Vitamin E"],
    benefits: [
      "Cushiony, non-sticky formula",
      "Wearable alone or under gloss",
      "Supports soft, smooth-looking lips",
      "Fragrance-free",
    ],
    howToUse: "Apply directly to lips as needed throughout the day.",
    peptideScience:
      "A gentle peptide blend formulated specifically for the thinner skin of the lips, designed to support a smoother, more conditioned-looking texture.",
    stock: 96,
    size: "0.15 oz / 4.3 g",
  },
  {
    id: "10",
    slug: "peptide-essentials-set",
    name: "Peptide Essentials Set",
    shortDescription:
      "A curated three-step peptide routine for cleansing, hydration and targeted treatment.",
    description:
      "Everything needed to start a dedicated peptide routine, curated into one set. Includes a gentle cleanser, our signature Peptide Renewal Serum, and Collagen Support Peptide Cream at a meaningful savings versus buying separately.",
    price: 129,
    compareAtPrice: 156,
    category: "Sets",
    concerns: ["Firmness", "Hydration", "Fine Lines"],
    tags: ["Best Value"],
    badge: "Best Value",
    rating: 4.9,
    reviewCount: 74,
    ingredients: [
      "Multi-Peptide Complex",
      "Sodium Hyaluronate",
      "Ceramide NP",
      "Niacinamide",
    ],
    benefits: [
      "Complete 3-step routine",
      "Curated for first-time peptide users",
      "Meaningful savings vs. buying separately",
      "Includes routine guide card",
    ],
    howToUse:
      "Cleanse, apply Peptide Renewal Serum, then seal with Collagen Support Peptide Cream morning and evening.",
    peptideScience:
      "A layered introduction to multiple peptide classes across three steps, designed to build a foundational peptide routine.",
    featured: true,
    stock: 33,
    size: "3-piece set",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getRelatedProducts(product: Product, count = 4): Product[] {
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category ||
          p.concerns.some((c) => product.concerns.includes(c)))
    )
    .slice(0, count);
}
