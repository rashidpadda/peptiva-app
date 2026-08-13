"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Best Sellers", href: "/shop?filter=bestseller" },
      { label: "Sets", href: "/shop?category=Sets" },
      { label: "New Arrivals", href: "/shop?filter=new" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Peptide Science", href: "/#peptide-science" },
      { label: "Ingredients", href: "/about#ingredients" },
      { label: "Skincare Guide", href: "/#routine" },
      { label: "FAQ", href: "/about#faq" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Contact", href: "/about#contact" },
      { label: "Shipping", href: "/about#shipping" },
      { label: "Returns", href: "/about#returns" },
      { label: "Order Tracking", href: "/account/orders" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Our Story", href: "/about#story" },
      { label: "Privacy", href: "/about#privacy" },
      { label: "Terms", href: "/about#terms" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-border-soft bg-beige">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <p className="font-serif text-2xl text-charcoal">PEPTIVA</p>
            <p className="mt-3 max-w-xs text-sm text-stone-600">
              Advanced Peptides. Visible Confidence.
            </p>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Get 10% off your first order
              </p>
              <form
                className="mt-3 flex max-w-sm gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!email.trim()) return;
                  toast.success("You're on the list", {
                    description: "Check your inbox for 10% off your first order.",
                  });
                  setEmail("");
                }}
              >
                <Input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white"
                />
                <Button type="submit" size="md" className="shrink-0">
                  Join
                </Button>
              </form>
            </div>
            <div className="mt-6 flex items-center gap-2 text-stone-500">
              {["IG", "FB", "X"].map((label) => (
                <span
                  key={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-400/60 text-[10px] font-medium tracking-wide"
                >
                  {label}
                </span>
              ))}
              <Mail className="ml-1 h-4 w-4" />
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-stone-700 hover:text-charcoal">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-stone-300/60 pt-6">
          <p className="text-[11px] leading-relaxed text-stone-500">
            These products are cosmetic/wellness formulations and are not intended to diagnose,
            treat, cure, or prevent disease.
          </p>
          <p className="mt-3 text-[11px] text-stone-400">
            © {new Date().getFullYear()} PEPTIVA. All rights reserved. This is a demonstration
            storefront — no real transactions are processed.
          </p>
        </div>
      </div>
    </footer>
  );
}
