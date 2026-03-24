import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import { Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductFilterSidebar from "@/components/product/filter-sidebar";

export const metadata = {
  title: "Tất cả sản phẩm | Cơ Khí Khải Hào",
  description: "Khám phá danh mục phụ tùng cơ khí phong phú: ổ bi, nhông xích, dây đai, khớp nối. Hàng chính hãng, giá tốt nhất.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function toMany(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function toNumber(value: string | string[] | undefined): number | null {
  const raw = toSingle(value);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildQueryString(
  params: Record<string, string | string[] | undefined>,
  overrides: Record<string, string | null>,
) {
  const q = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        q.append(key, item);
      }
      continue;
    }
    q.set(key, value);
  }

  for (const [key, value] of Object.entries(overrides)) {
    q.delete(key);
    if (value) q.set(key, value);
  }

  return q.toString();
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const p = await searchParams;
  const page = Math.max(1, parseInt(toSingle(p.page) || "1", 10));
  const q = toSingle(p.q);
  const limit = 16;
  const skip = (page - 1) * limit;

  const [categories, filterAttributes] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.categoryAttribute.findMany({
      where: {
        isActive: true,
        isGlobal: true,
        filterType: { not: "none" },
      },
      include: {
        options: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const andClauses: Prisma.ProductWhereInput[] = [];

  if (q) {
    andClauses.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  for (const attribute of filterAttributes) {
    const key = `attr_${attribute.slug}`;
    if (attribute.type === "select") {
      const selectedValues = toMany(p[key]);
      if (selectedValues.length > 0) {
        andClauses.push({
          attributeValues: {
            some: {
              attributeId: attribute.id,
              value: { in: selectedValues },
            },
          },
        });
      }
      continue;
    }

    if (attribute.type === "number") {
      const min = toNumber(p[`${key}_min`]);
      const max = toNumber(p[`${key}_max`]);

      if (min === null && max === null) continue;

      const values = await prisma.productAttributeValue.findMany({
        where: { attributeId: attribute.id },
        select: { productId: true, value: true },
      });

      const matchingProductIds = values
        .filter((item) => {
          const numericValue = Number(item.value);
          if (!Number.isFinite(numericValue)) return false;
          if (min !== null && numericValue < min) return false;
          if (max !== null && numericValue > max) return false;
          return true;
        })
        .map((item) => item.productId);

      andClauses.push({
        id: {
          in: matchingProductIds.length > 0 ? matchingProductIds : [-1],
        },
      });
    }
  }

  const whereClause: Prisma.ProductWhereInput = {
    isActive: true,
    ...(andClauses.length > 0 ? { AND: andClauses } : {}),
  };

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      take: limit,
      skip,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const formatPrice = (price: unknown) => {
    if (!price) return "—";
    const num = Number(price);
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-slate-500 mb-2">
            <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
            <span className="text-slate-800 font-medium">Sản phẩm</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {q ? `Kết quả tìm kiếm: "${q}"` : "Tất cả sản phẩm"}
          </h1>
          <p className="text-slate-500 mt-2">Hiển thị {products.length} trên tổng {totalCount} sản phẩm.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-72 flex-shrink-0">
            <ProductFilterSidebar
              basePath="/san-pham"
              searchParams={p}
              attributes={filterAttributes}
              categories={categories}
            />
          </div>

          <div className="flex-1">
            {products.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
                <Settings className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-slate-500">Thử tìm kiếm với từ khóa khác hoặc nới điều kiện lọc.</p>
                <Link href="/san-pham">
                  <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Xóa bộ lọc</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/san-pham/chi-tiet/${product.slug}`} className="group flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all hover:border-blue-300">
                    <div className="aspect-square bg-slate-100 relative overflow-hidden p-2">
                      <div className="w-full h-full relative rounded-lg overflow-hidden bg-white">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.name}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-500 p-2"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-200 bg-slate-50">
                            <Settings className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                      {product.priceOnRequest && (
                        <div className="absolute top-2 right-2 bg-slate-800 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded shadow-sm">
                          BÁO GIÁ
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col flex-grow border-t border-slate-100">
                      <div className="text-[10px] sm:text-xs text-slate-500 mb-1.5 flex items-center justify-between">
                        <span className="truncate pr-2">{product.category.name}</span>
                        <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-400">{product.sku}</span>
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm sm:text-base leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 flex-grow">
                        {product.name}
                      </h3>
                      <div className="mt-auto">
                        {product.priceOnRequest ? (
                          <p className="text-red-600 font-bold text-sm sm:text-base">Liên hệ Zalo</p>
                        ) : (
                          <p className="text-blue-700 font-bold text-sm sm:text-base">{formatPrice(product.price)}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === page;
                    const href = `/san-pham?${buildQueryString(p, { page: pageNum.toString() })}`;

                    return (
                      <Link
                        key={pageNum}
                        href={href}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
