import Link from "next/link";
import Image from "next/image";
import { Settings } from "lucide-react";

type ProductCardProduct = {
  id: number;
  slug: string;
  name: string;
  sku: string | null;
  // Accept Decimal from Prisma or plain number
  price: { toNumber(): number } | number | null;
  priceOnRequest: boolean;
  category: { name: string };
  images: { url: string; alt: string | null }[];
};

function formatPrice(price: { toNumber(): number } | number | null): string {
  if (price === null || price === undefined) return "Liên hệ";
  const num = typeof price === "number" ? price : price.toNumber();
  if (!num) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}

export default function ProductCard({ product }: { product: ProductCardProduct }) {
  return (
    <Link
      href={`/san-pham/chi-tiet/${product.slug}`}
      className="group flex flex-col bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-primary transition-all"
    >
      {/* Image */}
      <div className="relative flex items-center justify-center p-3 border-b border-slate-100 bg-white aspect-square">
        {product.images[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <Settings className="w-8 h-8 text-slate-200" />
        )}
        {product.priceOnRequest && (
          <span className="absolute top-2 left-2 bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
            BÁO GIÁ
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-wide text-slate-400 font-medium truncate mb-1">
          {product.category.name}
        </span>
        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-primary leading-snug line-clamp-2 flex-1">
          {product.name}
        </h3>
        <div className="mt-2 pt-2 border-t border-slate-100">
          {product.priceOnRequest ? (
            <span className="text-xs font-semibold text-red-600">Liên hệ tư vấn →</span>
          ) : (
            <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
