import prisma from "@/lib/prisma";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { Settings, ChevronRight } from "lucide-react";

import ProductFilterSidebar from "@/components/product/filter-sidebar";
import MobileFilterWrapper from "@/components/product/mobile-filter-wrapper";
import PaginationControls from "@/components/ui/pagination-controls";
import ProductCard from "@/components/product/product-card";
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

  const [products, groupedNames] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      distinct: ['name'],
      take: limit,
      skip,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: true,
      },
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
    }),
    prisma.product.groupBy({
      by: ['name'],
      where: whereClause,
    }),
  ]);

  const totalCount = groupedNames.length;

  const totalPages = Math.ceil(totalCount / limit);


  return (
    <div className="bg-slate-50 min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
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

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            
            {/* Page Header & Breadcrumb */}
            <div className="bg-white border border-slate-200 p-5 md:p-6 shadow-sm rounded-xl">
              <div className="flex items-center text-sm text-slate-500 mb-2 flex-wrap">
                <Link href="/" className="hover:text-blue-600 transition-colors whitespace-nowrap">Trang chủ</Link>
                <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 text-slate-300 shrink-0" />
                <span className="text-slate-800 font-medium whitespace-nowrap">Sản phẩm</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {q ? `Kết quả tìm kiếm: "${q}"` : "Danh sách sản phẩm"}
              </h1>
              <p className="text-sm text-slate-500 mt-2">Hiển thị {products.length} trên tổng số {totalCount} sản phẩm.</p>
            </div>

            {/* Product grid */}
            {products.length === 0 ? (
              <div className="bg-white py-20 border border-slate-200 shadow-sm rounded-xl text-center flex flex-col items-center">
                <Settings className="w-12 h-12 text-slate-200 animate-spin-slow mb-4" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy sản phẩm</h3>
                <p className="text-sm text-slate-500 mb-6">Thử tìm với từ khóa khác hoặc xóa bớt điều kiện lọc.</p>
                <Link href="/san-pham">
                  <button className="bg-slate-100 text-slate-700 font-semibold text-sm px-6 py-2 border border-slate-300 transition-colors hover:bg-slate-200 rounded-lg">
                    Xóa Bộ Lọc
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 lg:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
