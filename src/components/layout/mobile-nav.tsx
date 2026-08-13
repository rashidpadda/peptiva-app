"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export function MobileNav({
  open,
  onOpenChange,
  links,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links: { href: string; label: string }[];
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-6">
        <SheetTitle className="mb-8">PEPTIVA</SheetTitle>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => onOpenChange(false)}
              className="rounded-lg px-2 py-3 text-base text-stone-800 transition-colors hover:bg-beige"
            >
              {link.label}
            </Link>
          ))}
          <div className="my-3 h-px bg-border-soft" />
          <Link
            href="/account"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 rounded-lg px-2 py-3 text-base text-stone-800 transition-colors hover:bg-beige"
          >
            <User className="h-4 w-4" /> Account
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
