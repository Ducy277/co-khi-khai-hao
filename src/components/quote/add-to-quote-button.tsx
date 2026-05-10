"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addItemToQuoteCart } from "@/lib/quote-cart";
import { toast } from "sonner";

type AddToQuoteButtonProps = {
  product: {
    id: number;
    name: string;
    slug: string;
    sku: string;
    price: number | null;
    priceOnRequest: boolean;
    imageUrl?: string;
  };
};

export default function AddToQuoteButton({ product }: AddToQuoteButtonProps) {
  const handleAdd = () => {
    addItemToQuoteCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      priceOnRequest: product.priceOnRequest,
      imageUrl: product.imageUrl,
    });

    toast.success("Đã thêm sản phẩm vào giỏ");
  };

  return (
    <Button
      size="lg"
      className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg w-full h-14 col-span-1 border border-slate-700"
      onClick={handleAdd}
      type="button"
    >
      <ShoppingCart className="w-5 h-5 mr-2" />
      Thêm Giỏ
    </Button>
  );
}
