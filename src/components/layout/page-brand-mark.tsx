import Link from "next/link";
import { cn } from "@/lib/utils";

// Every page's own top-of-content wordmark - same treatment as the quick-buy
// widget header (PEPTIVA sitting directly above that page's eyebrow/heading)
// instead of a fixed corner element floating over everything.
export function PageBrandMark({ center = false }: { center?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "block font-serif text-lg tracking-wide text-charcoal/70 transition-colors hover:text-charcoal",
        center && "text-center"
      )}
    >
      PEPTIVA
    </Link>
  );
}
