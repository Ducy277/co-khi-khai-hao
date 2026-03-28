import Link from "next/link";
import prisma from "@/lib/prisma";
import ProductClientRenderer from "./_components/product-client";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

export const metadata = {
  title: "Quản lý Sản phẩm | Admin",
};

export default async function ProductPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      brand: true,
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      _count: {
        select: { quoteItems: true }
      }
    },
  });

  const productsWithFallbackImage = await Promise.all(
    products.map(async (p) => {
      let coverImage = p.images[0]?.url;
      if (!coverImage) {
        const fallback = await prisma.productImage.findFirst({
          where: { productId: p.id },
          orderBy: { sortOrder: "asc" }
        });
        coverImage = fallback?.url || "";
      }
      return {
        ...p,
        coverImage,
      };
    })
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sản phẩm</h1>
          <p className="text-slate-500 mt-1">
            Quản lý danh sách sản phẩm, giá bán, hình ảnh và thuộc tính kỹ thuật.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a href="/api/admin/san-pham/export" download>
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              <Download className="w-4 h-4 mr-2" />
              Xuất CSV
            </Button>
          </a>
          <Link href="/admin/san-pham/import">
            <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
          </Link>
        </div>
      </div>

      <ProductClientRenderer initialProducts={productsWithFallbackImage} />
    </div>
  );
}
