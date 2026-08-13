import type { ProductCategory, SkinConcern } from "@/lib/types";

export const categories: ProductCategory[] = [
  "Serums",
  "Moisturizers",
  "Essences",
  "Eye Care",
  "Masks",
  "Treatments",
  "Lip Care",
  "Sets",
];

export const concerns: { name: SkinConcern; description: string }[] = [
  { name: "Fine Lines", description: "Support smoother-looking texture" },
  { name: "Firmness", description: "Support a firmer-looking appearance" },
  { name: "Hydration", description: "Replenish and lock in moisture" },
  { name: "Barrier Support", description: "Support a healthy-looking barrier" },
  { name: "Eye Care", description: "Targeted care for the eye contour" },
  { name: "Glow", description: "Support a radiant, even-looking tone" },
];
