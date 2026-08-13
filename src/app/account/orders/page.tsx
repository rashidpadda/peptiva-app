"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { useOrdersStore } from "@/store/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default function AccountOrdersPage() {
  const orders = useOrdersStore((s) => s.orders);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Package className="h-8 w-8 text-stone-400" />
        <p className="font-serif text-xl text-charcoal">No orders yet</p>
        <Link href="/shop" className="text-sm text-sage-dark underline underline-offset-4">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="flex flex-col gap-3 rounded-2xl border border-border-soft p-5 transition-colors hover:border-sage sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-medium text-charcoal">{order.id}</p>
            <p className="text-xs text-stone-500">
              {formatDate(order.date)} · {order.items.length} item
              {order.items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="subtle">{STATUS_LABEL[order.status]}</Badge>
            <span className="text-sm font-medium text-charcoal">{formatCurrency(order.total)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
