import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import { Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductFilterSidebar from "@/components/product/filter-sidebar";
import MobileFilterWrapper from "@/components/product/mobile-filter-wrapper";
import { buildSearchFilter } from "@/lib/search";

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

  const searchFilter = buildSearchFilter(q);
  if (searchFilter) {
    andClauses.push(searchFilter);
  }

  for (const attribute of filterAttributes) {
    const key = `attr_${attribute.slug}`;
    if (attribute.type === "select") {
      const selectedValues = toMany(p[key]);
      console.log(`[DEBUG] Attribute ${key} selectedValues:`, selectedValues);
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
    <div className="bg-slate-50 min-h-screen pb-16 pt-6">
      <div className="container mx-auto sm:px-6 mb-6">
        {/* Breadcrumb & Title */}
        <div className="bg-white border border-slate-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 mb-4 border-b border-slate-100 pb-2">
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800">Sản phẩm</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {q ? `Kết quả tìm kiếm: "${q}"` : "Danh sách sản phẩm"}
            </h1>
            <span className="text-sm font-medium text-slate-500">
              {totalCount} sản phẩm
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* Sidebar */}
          <MobileFilterWrapper>
            <ProductFilterSidebar
              basePath="/san-pham"
              searchParams={p}
              attributes={filterAttributes}
              categories={categories}
              totalProducts={totalCount}
            />
          </MobileFilterWrapper>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {products.length === 0 ? (
              <div className="bg-white py-20 border border-slate-200 shadow-sm text-center flex flex-col items-center">
                <Settings className="w-12 h-12 text-slate-200 animate-spin-slow mb-4" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy sản phẩm</h3>
                <p className="text-sm text-slate-500 mb-6">Thử tìm với từ khóa khác hoặc xóa bớt điều kiện lọc.</p>
                <Link href="/san-pham">
                  <button className="bg-slate-100 text-slate-700 font-semibold text-sm px-6 py-2 border border-slate-300 transition-colors hover:bg-slate-200">
                    Xóa Bộ Lọc
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-5">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/san-pham/chi-tiet/${product.slug}`}
                    className="group flex flex-row md:flex-col bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-primary transition-all"
                  >
                    {/* Image */}
                    <div className="shrink-0 w-[120px] h-auto min-h-[120px] md:h-[150px] md:min-h-0 md:w-full relative flex items-center justify-center p-3 border-r md:border-r-0 md:border-b border-slate-100 bg-white">
                      {product.images[0] ? (
                        <div className="relative w-[90px] h-[90px] md:w-[100px] md:h-[100px]">
                          <Image
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.name}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                          />
                        </div>
                      ) : (
                        <Settings className="w-6 h-6 text-slate-300" />
                      )}
                      {product.priceOnRequest && (
                        <span className="absolute top-2 left-2 bg-red-50 text-red-600 border border-red-100 text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                          BÁO GIÁ
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 md:p-4 flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px] tracking-wide text-slate-500 mb-1 md:mb-2 font-medium">
                        <span className="truncate pr-1 uppercase text-[10px]">{product.category.name}</span>
                        <span className="text-slate-400 font-normal hidden sm:inline">SKU: {product.sku}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary leading-snug line-clamp-2 md:mb-3">
                        {product.name}
                      </h3>
                      <div className="mt-auto pt-2 md:pt-3 border-t border-slate-100 flex justify-between items-center text-right">
                        {product.priceOnRequest ? (
                          <span className="text-xs font-semibold text-red-600 block mt-1 hover:underline">Liên hệ tư vấn →</span>
                        ) : (
                          <span className="text-[14px] md:text-[15px] font-bold text-primary">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 mb-8">
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === page;
                    return (
                      <Link
                        key={pageNum}
                        href={`/san-pham?${buildQueryString(p, { page: pageNum.toString() })}`}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-medium transition-all border ${
                          isActive
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
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
