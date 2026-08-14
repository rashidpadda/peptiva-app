"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, Heart, ShoppingBag, User } from "lucide-react";
import { useCartStore, getItemCount } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { MobileNav } from "@/components/layout/mobile-nav";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?filter=bestseller", label: "Best Sellers" },
  { href: "/#peptide-science", label: "Peptide Science" },
  { href: "/quick-buy", label: "Quick Buy" },
  { href: "/about", label: "About" },
];

function IconBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sage px-1 text-[10px] font-semibold text-white">
      {count}
    </span>
  );
}

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openDrawer);
  const favoriteCount = useFavoritesStore((s) => s.productIds.length);
  const cartCount = getItemCount(items);

  return (
    <>
      <div className="sticky top-0 z-40 w-full">
        <div className="bg-charcoal py-2 text-center text-[11px] font-medium uppercase tracking-wider text-ivory">
          Complimentary shipping on orders over $75
        </div>
        <header className="border-b border-border-soft bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 md:hidden">
              <button
                aria-label="Open menu"
                onClick={() => setMobileNavOpen(true)}
                className="flex h-10 w-10 items-center justify-center text-charcoal"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <Link href="/" className="font-serif text-2xl tracking-wide text-charcoal">
              PEPTIVA
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-stone-700 transition-colors hover:text-charcoal"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="hidden h-10 w-10 items-center justify-center text-stone-700 transition-colors hover:text-charcoal sm:flex"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
              <button
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center text-stone-700 sm:hidden"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
              <Link
                href="/account"
                aria-label="Account"
                className="hidden h-10 w-10 items-center justify-center text-stone-700 transition-colors hover:text-charcoal md:flex"
              >
                <User className="h-[18px] w-[18px]" />
              </Link>
              <Link
                href="/favorites"
                aria-label="Favorites"
                className="relative flex h-10 w-10 items-center justify-center text-stone-700 transition-colors hover:text-charcoal"
              >
                <Heart className="h-[18px] w-[18px]" />
                <IconBadge count={favoriteCount} />
              </Link>
              <button
                aria-label="Open cart"
                onClick={openCart}
                className="relative flex h-10 w-10 items-center justify-center text-stone-700 transition-colors hover:text-charcoal"
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                <IconBadge count={cartCount} />
              </button>
            </div>
          </div>
        </header>
      </div>

      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} links={NAV_LINKS} />
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
