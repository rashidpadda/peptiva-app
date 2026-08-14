import type { Metadata } from "next";
import { QuickBuyWidget } from "@/components/quick-buy/quick-buy-widget";

export const metadata: Metadata = {
  title: "Quick Buy",
  description: "Add your favorite peptide formulas and check out in a few quick steps.",
};

export default function QuickBuyPage() {
  return <QuickBuyWidget />;
}
