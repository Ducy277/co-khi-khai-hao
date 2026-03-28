import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

// Tạo slug từ chuỗi tiếng Việt
function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let csvText: string;
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
    }
    csvText = await file.text();
  } catch {
    return NextResponse.json({ error: "Không đọc được file" }, { status: 400 });
  }

  // Parse CSV
  const { data: rows, errors } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (errors.length > 0 && rows.length === 0) {
    return NextResponse.json({ error: "File CSV không hợp lệ" }, { status: 400 });
  }

  // Pre-load lookups
  const [categories, brands, allAttributes] = await Promise.all([
    prisma.category.findMany({ select: { id: true, slug: true } }),
    prisma.brand.findMany({ select: { id: true, slug: true } }),
    prisma.categoryAttribute.findMany({
      where: { isActive: true },
      select: { id: true, slug: true },
    }),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));
  const brandMap = new Map(brands.map((b) => [b.slug, b.id]));
  const attrMap = new Map(allAttributes.map((a) => [a.slug, a.id]));

  const report = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [] as string[],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed + header

    const sku = row["sku"]?.trim();
    const name = row["name"]?.trim();
    const categorySlug = row["categorySlug"]?.trim();

    if (!sku || !name || !categorySlug) {
      report.errors.push(`Dòng ${rowNum}: Thiếu sku, name hoặc categorySlug`);
      report.skipped++;
      continue;
    }

    const categoryId = categoryMap.get(categorySlug);
    if (!categoryId) {
      report.errors.push(`Dòng ${rowNum}: Danh mục "${categorySlug}" không tồn tại`);
      report.skipped++;
      continue;
    }

    const brandSlug = row["brandSlug"]?.trim();
    const brandId = brandSlug ? brandMap.get(brandSlug) ?? null : null;

    const priceRaw = row["price"]?.trim();
    const price = priceRaw ? parseFloat(priceRaw) : null;

    const productData = {
      name,
      categoryId,
      brandId: brandId ?? null,
      price: price && !isNaN(price) ? price : null,
      priceOnRequest: row["priceOnRequest"] === "1",
      isFeatured: row["isFeatured"] === "1",
      isActive: row["isActive"] !== "0", // default true
      description: row["description"]?.trim() || null,
    };

    // Collect attr values từ columns có prefix "attr_"
    const attrEntries: { attributeId: number; value: string }[] = [];
    for (const [col, val] of Object.entries(row)) {
      if (!col.startsWith("attr_")) continue;
      const attrSlug = col.replace(/^attr_/, "");
      const attributeId = attrMap.get(attrSlug);
      const value = val?.trim();
      if (attributeId && value) {
        attrEntries.push({ attributeId, value });
      }
    }

    try {
      const existing = await prisma.product.findUnique({ where: { sku } });

      if (existing) {
        // Update
        await prisma.product.update({
          where: { sku },
          data: productData,
        });

        // Upsert attribute values
        for (const entry of attrEntries) {
          await prisma.productAttributeValue.upsert({
            where: { productId_attributeId: { productId: existing.id, attributeId: entry.attributeId } },
            create: { productId: existing.id, ...entry },
            update: { value: entry.value },
          });
        }

        report.updated++;
      } else {
        // Create với slug auto-generated
        let slug = slugify(name);
        const existing_slug = await prisma.product.findUnique({ where: { slug } });
        if (existing_slug) {
          slug = `${slug}-${sku.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
        }

        const created = await prisma.product.create({
          data: {
            ...productData,
            sku,
            slug,
            attributeValues: {
              create: attrEntries,
            },
          },
        });

        // Nếu có imageUrl, tạo ProductImage
        const imageUrl = row["imageUrl"]?.trim();
        if (imageUrl) {
          await prisma.productImage.create({
            data: { productId: created.id, url: imageUrl, isPrimary: true, sortOrder: 0 },
          });
        }

        report.created++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      report.errors.push(`Dòng ${rowNum} (SKU: ${sku}): ${msg}`);
      report.skipped++;
    }
  }

  return NextResponse.json({ success: true, report }, { status: 200 });
}
