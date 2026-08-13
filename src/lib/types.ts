export type ProductCategory =
  | "Serums"
  | "Moisturizers"
  | "Essences"
  | "Eye Care"
  | "Masks"
  | "Treatments"
  | "Lip Care"
  | "Sets";

export type SkinConcern =
  | "Fine Lines"
  | "Firmness"
  | "Hydration"
  | "Barrier Support"
  | "Eye Care"
  | "Glow";

export type ProductBadge = "Bestseller" | "New" | "Premium" | "Best Value";

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: ProductCategory;
  concerns: SkinConcern[];
  tags: string[];
  badge?: ProductBadge;
  rating: number;
  reviewCount: number;
  ingredients: string[];
  benefits: string[];
  howToUse: string;
  peptideScience: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  stock: number;
  size: string;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
};

export type CartItem = {
  productId: string;
  quantity: number;
  savedForLater?: boolean;
};

export type Address = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type CustomerInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subscribe: boolean;
};

export type ShippingMethod = "standard" | "express";

export type PaymentMethod = "card" | "paypal" | "apple-pay";

export type CardDetails = {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  date: string;
  customer: CustomerInfo;
  shippingAddress: Address;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: "processing" | "shipped" | "delivered";
};
