import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Lấy tất cả attributes để build header động
  const allAttributes = await prisma.categoryAttribute.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, name: true },
  });

  const products = await prisma.product.findMany({
    include: {
      category: { select: { slug: true, name: true } },
      brand: { select: { slug: true, name: true } },
      images: { where: { isPrimary: true }, take: 1 },
      attributeValues: {
        include: { attribute: { select: { slug: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Build CSV header
  const attrHeaders = allAttributes.map((a) => `attr_${a.slug}`);
  const headers = [
    "id",
    "name",
    "sku",
    "categorySlug",
    "brandSlug",
    "price",
    "priceOnRequest",
    "isFeatured",
    "isActive",
    "description",
    "imageUrl",
    ...attrHeaders,
  ];

  const escape = (value: unknown): string => {
    const str = value === null || value === undefined ? "" : String(value);
    // Bọc trong dấu nháy kép nếu có dấu phẩy, nháy kép hoặc xuống dòng
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows: string[] = [headers.join(",")];

  for (const product of products) {
    const attrMap = new Map(
      product.attributeValues.map((av) => [av.attribute.slug, av.value])
    );
    const attrValues = allAttributes.map((a) => escape(attrMap.get(a.slug) ?? ""));

    const row = [
      escape(product.id),
      escape(product.name),
      escape(product.sku),
      escape(product.category.slug),
      escape(product.brand?.slug ?? ""),
      escape(product.price?.toString() ?? ""),
      escape(product.priceOnRequest ? "1" : "0"),
      escape(product.isFeatured ? "1" : "0"),
      escape(product.isActive ? "1" : "0"),
      escape(product.description ?? ""),
      escape(product.images[0]?.url ?? ""),
      ...attrValues,
    ];

    rows.push(row.join(","));
  }

  const csvContent = "\uFEFF" + rows.join("\r\n"); // BOM cho Excel UTF-8
  const fileName = `san-pham-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
