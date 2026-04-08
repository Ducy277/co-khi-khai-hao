import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import { Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import ProductFilterSidebar from "@/components/product/filter-sidebar";
import MobileFilterWrapper from "@/components/product/mobile-filter-wrapper";
import { buildSearchFilter } from "@/lib/search";

type Props = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const category = await prisma.category.findUnique({
    where: { slug: p.categorySlug },
  });

  if (!category) {
    return { title: "Sản phẩm | Cơ Khí Khải Hào" };
  }

  return {
    title: `${category.name} chính hãng | Cơ Khí Khải Hào`,
    description: `Mua ${category.name.toLowerCase()} chất lượng cao, giá tốt tại Cơ Khí Khải Hào. Hàng chính hãng, đa dạng quy cách.`,
    alternates: {
      canonical: `/san-pham/${category.slug}`,
    },
  };
}

export default async function CategoryProductsPage({
  params,
  searchParams,
}: Props) {
  const [p, s] = await Promise.all([params, searchParams]);
  const categorySlug = p.categorySlug;
  const page = Math.max(1, parseInt(toSingle(s.page) || "1", 10));
  const q = toSingle(s.q);
  const limit = 16;
  const skip = (page - 1) * limit;

  const currentCategory = await prisma.category.findUnique({
    where: { slug: categorySlug },
    include: { parent: true },
  });

  if (!currentCategory) notFound();

  const [allCategories, attributes] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, parentId: true, slug: true, name: true, sortOrder: true },
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.categoryAttribute.findMany({
      where: {
        isActive: true,
        filterType: { not: "none" },
        OR: [{ isGlobal: true }, { categoryId: currentCategory.id }],
      },
      include: {
        options: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const collectDescendantIds = (rootId: number) => {
    const ids = new Set<number>([rootId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const cat of allCategories) {
        if (cat.parentId && ids.has(cat.parentId) && !ids.has(cat.id)) {
          ids.add(cat.id);
          changed = true;
        }
      }
    }
    return Array.from(ids);
  };

  const categoryIdsToSearch = collectDescendantIds(currentCategory.id);

  const andClauses: Prisma.ProductWhereInput[] = [
    { categoryId: { in: categoryIdsToSearch } },
  ];

  const searchFilter = buildSearchFilter(q);
  if (searchFilter) {
    andClauses.push(searchFilter);
  }

  for (const attribute of attributes) {
    const key = `attr_${attribute.slug}`;
    if (attribute.type === "select") {
      const selectedValues = toMany(s[key]);
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
      const min = toNumber(s[`${key}_min`]);
      const max = toNumber(s[`${key}_max`]);

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
    AND: andClauses,
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
          <div className="flex items-center text-sm text-slate-500 mb-2 flex-wrap">
            <Link href="/" className="hover:text-blue-600 transition-colors whitespace-nowrap">Trang chủ</Link>
            <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 text-slate-300 flex-shrink-0" />
            <Link href="/san-pham" className="hover:text-blue-600 transition-colors whitespace-nowrap">Sản phẩm</Link>

            {currentCategory.parent && (
              <>
                <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 text-slate-300 flex-shrink-0" />
                <Link href={`/san-pham/${currentCategory.parent.slug}`} className="hover:text-blue-600 transition-colors whitespace-nowrap">
                  {currentCategory.parent.name}
                </Link>
              </>
            )}

            <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 text-slate-300 flex-shrink-0" />
            <span className="text-slate-800 font-medium whitespace-nowrap">{currentCategory.name}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {q ? `Tìm kiếm trong "${currentCategory.name}": ${q}` : currentCategory.name}
          </h1>
          <p className="text-slate-500 mt-2">Hiển thị {products.length} trên tổng {totalCount} sản phẩm.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <MobileFilterWrapper>
            <ProductFilterSidebar
              basePath={`/san-pham/${currentCategory.slug}`}
              searchParams={s}
              attributes={attributes}
              categories={allCategories}
              currentCategoryId={currentCategory.id}
              currentParentCategoryId={currentCategory.parentId}
              totalProducts={totalCount}
            />
          </MobileFilterWrapper>

          <div className="flex-1">
            {products.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
                <Settings className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có sản phẩm</h3>
                <p className="text-slate-500">Danh mục &quot;{currentCategory.name}&quot; hiện chưa có sản phẩm phù hợp bộ lọc.</p>
                <Link href={`/san-pham/${currentCategory.slug}`}>
                  <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Xem tất cả trong danh mục</Button>
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

            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === page;
                    const href = `/san-pham/${currentCategory.slug}?${buildQueryString(s, { page: pageNum.toString() })}`;

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
