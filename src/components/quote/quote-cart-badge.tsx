"use client";

import { useEffect, useState } from "react";
import { getQuoteCartCount, QUOTE_CART_EVENT } from "@/lib/quote-cart";

type QuoteCartBadgeProps = {
  className?: string;
};

export default function QuoteCartBadge({ className }: QuoteCartBadgeProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const syncCount = () => {
      setCount(getQuoteCartCount());
    };

    syncCount();
    window.addEventListener("storage", syncCount);
    window.addEventListener(QUOTE_CART_EVENT, syncCount);

    return () => {
      window.removeEventListener("storage", syncCount);
      window.removeEventListener(QUOTE_CART_EVENT, syncCount);
    };
  }, []);

  return <span className={className}>{count}</span>;
}
