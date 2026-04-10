import Link from "next/link";
import prisma from "@/lib/prisma";
import ProductClientRenderer from "./_components/product-client";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

export const metadata = {
  title: "Quản lý Sản phẩm | Admin",
};

const PAGE_SIZE = 30;

interface SearchParams {
  page?: string;
  search?: string;
  category?: string;
}

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page || "1", 10));
  const search = params.search?.trim() || "";
  const categoryId = params.category ? parseInt(params.category, 10) : undefined;

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { sku: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: true,
        brand: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        _count: {
          select: { quoteItems: true },
        },
      },
    }),
  ]);

  // Get cover image for products without primary image
  const productsWithFallbackImage = await Promise.all(
    products.map(async (p) => {
      let coverImage = p.images[0]?.url;
      if (!coverImage) {
        const fallback = await prisma.productImage.findFirst({
          where: { productId: p.id },
          orderBy: { sortOrder: "asc" },
        });
        coverImage = fallback?.url || "";
      }
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        // Convert Decimal to plain number to fix "Only plain objects can be passed" error
        price: p.price ? Number(p.price) : null,
        priceOnRequest: p.priceOnRequest,
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        categoryId: p.categoryId,
        brandId: p.brandId,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        category: p.category,
        brand: p.brand,
        _count: p._count,
        coverImage,
      };
    })
  );

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, parentId: true },
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

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

      <ProductClientRenderer
        initialProducts={productsWithFallbackImage}
        categories={categories}
        total={total}
        page={page}
        totalPages={totalPages}
        search={search}
        categoryId={categoryId}
      />
    </div>
  );
}
