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
import PaginationControls from "@/components/ui/pagination-controls";
import ProductCard from "@/components/product/product-card";
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

  const [allCategories, rawAttributes] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, parentId: true, slug: true, name: true, sortOrder: true },
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.categoryAttribute.findMany({
      where: {
        isActive: true,
        filterType: { not: "none" },
        OR: [
          { isGlobal: true },
          { categoryId: currentCategory.id },
          { categoryId: currentCategory.parentId || undefined },
        ],
      },
      include: {
        options: { orderBy: { sortOrder: "asc" } },
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

  // ── Filter attributes to only those that have products in this category ──
  // This prevents sibling-subcategory attributes from leaking in via the
  // parent category. e.g. "Cỡ xích" (from "Khớp nối xích") should NOT appear
  // when browsing "Ốc chìm", even though both share the "Khớp nối" parent.
  const attrIdsWithValues = await prisma.productAttributeValue
    .findMany({
      where: {
        attributeId: { in: rawAttributes.map((a) => a.id) },
        product: {
          isActive: true,
          categoryId: { in: categoryIdsToSearch },
        },
      },
      select: { attributeId: true },
      distinct: ["attributeId"],
    })
    .then((rows) => new Set(rows.map((r) => r.attributeId)));

  const attributes = rawAttributes.filter((a) => attrIdsWithValues.has(a.id));

  const baseClauses: Prisma.ProductWhereInput[] = [
    { categoryId: { in: categoryIdsToSearch } },
  ];

  const searchFilter = buildSearchFilter(q);
  if (searchFilter) {
    baseClauses.push(searchFilter);
  }

  const attrClauseMap = new Map<number, Prisma.ProductWhereInput>();

  for (const attribute of attributes) {
    const key = `attr_${attribute.slug}`;
    if (attribute.type === "select") {
      const selectedValues = toMany(s[key]);
      if (selectedValues.length > 0) {
        attrClauseMap.set(attribute.id, {
          attributeValues: {
            some: {
              attributeId: attribute.id,
              value: { in: selectedValues },
            },
          },
        });
      }
    }
    if (attribute.type === "number") {
      const min = toNumber(s[`${key}_min`]);
      const max = toNumber(s[`${key}_max`]);
      if (min !== null || max !== null) {
        attrClauseMap.set(attribute.id, {} as Prisma.ProductWhereInput);
      }
    }
  }

  const andClauses: Prisma.ProductWhereInput[] = [...baseClauses];

  for (const attribute of attributes) {
    const key = `attr_${attribute.slug}`;

    if (attribute.type === "select") {
      const clause = attrClauseMap.get(attribute.id);
      if (clause) andClauses.push(clause);
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

  const hasAnyAttrFilter = attrClauseMap.size > 0;
  const availableValues: Record<number, string[]> = {};

  if (hasAnyAttrFilter) {
    const selectAttrs = attributes.filter(
      (a) => a.type === "select" || a.type === "checkbox"
    );

    await Promise.all(
      selectAttrs.map(async (attr) => {
        const otherAttrClauses = Array.from(attrClauseMap.entries())
          .filter(([id]) => id !== attr.id)
          .map(([, clause]) => clause)
          .filter((c) => Object.keys(c).length > 0);

        const otherWhere: Prisma.ProductWhereInput = {
          isActive: true,
          AND: [...baseClauses, ...otherAttrClauses],
        };

        const allVals = await prisma.productAttributeValue.findMany({
          where: {
            attributeId: attr.id,
            product: otherWhere,
          },
          select: { value: true },
        });

        const uniqueVals = [...new Set(allVals.map((v) => v.value))];
        availableValues[attr.id] = uniqueVals;
      })
    );
  }

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

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-slate-500 mb-2 flex-wrap">
            <Link href="/" className="hover:text-blue-600 transition-colors whitespace-nowrap">Trang chủ</Link>
            <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 text-slate-300 shrink-0" />
            <Link href="/san-pham" className="hover:text-blue-600 transition-colors whitespace-nowrap">Sản phẩm</Link>

            {currentCategory.parent && (
              <>
                <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 text-slate-300 shrink-0" />
                <Link href={`/san-pham/${currentCategory.parent.slug}`} className="hover:text-blue-600 transition-colors whitespace-nowrap">
                  {currentCategory.parent.name}
                </Link>
              </>
            )}

            <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 text-slate-300 shrink-0" />
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
              availableValues={hasAnyAttrFilter ? availableValues : undefined}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-4">
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
