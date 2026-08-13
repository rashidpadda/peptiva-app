"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, User, Package, Heart, MapPin, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/favorites", label: "Favorites", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/payment-methods", label: "Payment Methods", icon: CreditCard },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="space-y-1">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active ? "bg-charcoal text-ivory" : "text-stone-700 hover:bg-beige"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
      <button
        onClick={() => {
          toast("You're signed out", { description: "This is a demo account." });
          router.push("/");
        }}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-stone-500 transition-colors hover:bg-beige hover:text-charcoal"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </nav>
  );
}
