import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
import * as Papa from "papaparse";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

function slugify(str: string): string {
  if (!str) return "";
  let slug = str.toLowerCase().trim();
  slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, "a");
  slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, "e");
  slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, "i");
  slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, "o");
  slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, "u");
  slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, "y");
  slug = slug.replace(/đ/gi, "d");
  slug = slug.replace(/[^a-z0-9]+/g, "-");
  slug = slug.replace(/^-+|-+$/g, "");
  return slug;
}

interface CSVRow {
  "SKU": string;
  "Danh mục": string;
  "Danh mục con": string;
  "Tên sản phẩm": string;
  "Thông số kỹ thuật": string;
  "Xuất xứ": string;
  "Giá (VNĐ)": string;
}

async function seedCatalogFromCSV() {
  const csvFilePath = path.join(__dirname, "san_pham_chuan_hoa.csv");
  if (!fs.existsSync(csvFilePath)) {
    console.log(`⚠️ Không tìm thấy file ${csvFilePath}, bỏ qua seed catalog từ CSV.`);
    return;
  }

  const csvData = fs.readFileSync(csvFilePath, "utf8");
  const parsed = Papa.parse<CSVRow>(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.error("Lỗi khi đọc file CSV:", parsed.errors);
    return;
  }

  console.log(`📂 Đọc được ${parsed.data.length} sản phẩm từ CSV.`);

  const categoryMap = new Map<string, number>();
  const brandMap = new Map<string, number>();
  const attributeMap = new Map<string, { id: number; options: Set<string>; type: string }>();

  // START IMPORT
  console.log("➡️ Xóa dữ liệu catalog cũ...");
  await prisma.quoteRequestItem.deleteMany({});
  await prisma.productAttributeValue.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.attributeOption.deleteMany({});
  await prisma.categoryAttribute.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});

  console.log("➡️ Tạo danh mục...");
  for (const row of parsed.data) {
    const l1Name = row["Danh mục"]?.trim();
    const l2Name = row["Danh mục con"]?.trim();

    if (!l1Name) continue;

    const l1Slug = slugify(l1Name);
    if (!categoryMap.has(l1Slug)) {
      const l1Cat = await prisma.category.create({
        data: { name: l1Name, slug: l1Slug },
      });
      categoryMap.set(l1Slug, l1Cat.id);
    }

    if (l2Name) {
      const l2Slug = slugify(l2Name);
      if (!categoryMap.has(l2Slug)) {
        const l1Id = categoryMap.get(l1Slug)!;
        const l2Cat = await prisma.category.create({
          data: { name: l2Name, slug: `${l1Slug}-${l2Slug}`, parentId: l1Id },
        });
        categoryMap.set(l2Slug, l2Cat.id);
      }
    }
  }

  console.log("➡️ Tạo thương hiệu...");
  for (const row of parsed.data) {
    let brandName = row["Xuất xứ"]?.trim();
    if (!brandName) brandName = "No Brand";

    const brandSlug = slugify(brandName);
    if (!brandMap.has(brandSlug)) {
      const brand = await prisma.brand.create({
        data: { name: brandName === "No Brand" ? "Không rõ" : brandName, slug: brandSlug },
      });
      brandMap.set(brandSlug, brand.id);
    }
  }

  console.log("➡️ Tạo thuộc tính (Attributes)...");
  const rawAttributes = new Map<string, { name: string, categoryId: number, options: Set<string> }>();
  for (const row of parsed.data) {
    const l1Name = row["Danh mục"]?.trim();
    const l1Slug = l1Name ? slugify(l1Name) : "";
    const l1Id = categoryMap.get(l1Slug);
    if (!l1Id) continue;

    const tskt = row["Thông số kỹ thuật"];
    if (!tskt) continue;

    const pairs = tskt.split("|").map(t => t.trim()).filter(Boolean);
    for (const pair of pairs) {
      const parts = pair.split(":");
      if (parts.length >= 2) {
        const attrName = parts[0].trim();
        const attrValue = parts.slice(1).join(":").trim();
        const attrSlug = slugify(attrName);
        const compositeKey = `${l1Id}_${attrSlug}`;

        if (!rawAttributes.has(compositeKey)) {
          rawAttributes.set(compositeKey, { name: attrName, categoryId: l1Id, options: new Set() });
        }
        if (attrValue) rawAttributes.get(compositeKey)!.options.add(attrValue);
      }
    }
  }

  for (const [compositeKey, meta] of Array.from(rawAttributes.entries())) {
    const friendlySlug = slugify(meta.name);
    const attr = await prisma.categoryAttribute.create({
      data: {
        name: meta.name,
        slug: friendlySlug,
        type: "select",
        filterType: "checkbox",
        isGlobal: false,
        categoryId: meta.categoryId,
        options: {
          create: Array.from(meta.options).map((opt, idx) => ({ value: opt, sortOrder: idx })),
        },
      },
      include: { options: true },
    });

    attributeMap.set(compositeKey, { id: attr.id, options: new Set(attr.options.map(o => o.value)), type: attr.type });
  }

  console.log("➡️ Import sản phẩm (tiến trình này có thể mất vài phút)...");
  let importedCount = 0;
  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    const name = row["Tên sản phẩm"]?.trim();
    if (!name) continue;

    const sku = row["SKU"]?.trim();
    const l1Name = row["Danh mục"]?.trim();
    const l2Name = row["Danh mục con"]?.trim();
    const l1Id = categoryMap.get(slugify(l1Name));
    const l2Id = l2Name ? categoryMap.get(slugify(l2Name)) : null;

    const brandSlug = slugify(row["Xuất xứ"]?.trim() || "Không rõ");
    const brandId = brandMap.get(brandSlug);

    const priceRaw = row["Giá (VNĐ)"]?.trim().replace(/[^\d]/g, "");
    const priceNum = priceRaw ? parseInt(priceRaw, 10) : null;
    const priceOnRequest = !priceNum;

    const categoryIdForProduct = l2Id || l1Id;
    if (!categoryIdForProduct) continue;

    const tskt = row["Thông số kỹ thuật"];
    const attrValuesToCreate = [];
    if (tskt && l1Id) {
      const pairs = tskt.split("|").map(t => t.trim()).filter(Boolean);
      for (const pair of pairs) {
        const parts = pair.split(":");
        if (parts.length >= 2) {
          const attrName = parts[0].trim();
          const attrValue = parts.slice(1).join(":").trim();
          const compositeKey = `${l1Id}_${slugify(attrName)}`;
          const attrDef = attributeMap.get(compositeKey);
          if (attrDef) {
            attrValuesToCreate.push({ attributeId: attrDef.id, value: attrValue });
          }
        }
      }
    }

    const slug = slugify(name);
    
    // Xóa tên hãng ở cuối tên sản phẩm (nếu có) để chuẩn hóa tên
    let finalName = name;
    const brandName = row["Xuất xứ"]?.trim();
    if (brandName && finalName.endsWith(brandName)) {
      finalName = finalName.substring(0, finalName.length - brandName.length).trim();
    }

    try {
      await prisma.product.create({
        data: {
          name: finalName,
          slug: `${slug}-${sku}`,
          sku: sku,
          price: priceNum,
          priceOnRequest: priceOnRequest,
          categoryId: categoryIdForProduct,
          brandId: brandId,
          attributeValues: { create: attrValuesToCreate },
        },
      });
      importedCount++;
    } catch (e: unknown) {
      console.error(`Lỗi import mục SKU ${sku}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  console.log(`✅ Import hoàn tất ${importedCount} sản phẩm.`);
}

async function main() {
  console.log("🌱 Bắt đầu seed data...");

  // ============================================================
  // 1. ADMIN USER
  // ============================================================
  const adminEmail = process.env.ADMIN_EMAIL || "khaihao.99@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "Admin CKKH",
      role: "admin",
    },
    update: { password: hashedPassword },
  });
  console.log("✅ Admin user created:", adminEmail);

  // ============================================================
  // 2. BANNERS & SITE CONTENT
  // ============================================================
  await prisma.banner.upsert({
    where: { id: 1 },
    create: {
      title: "Phụ Tùng Cơ Khí Chính Hãng",
      subtitle: "Ổ bi, bánh răng, bu lông - Gia công theo yêu cầu",
      image: "/uploads/banners/banner-default.jpg",
      link: "/san-pham",
      sortOrder: 1,
      isActive: true,
    },
    update: {},
  });

  const contents = [
    { key: "about_short", value: "Cơ Khí Khải Hào - hơn 10 năm kinh nghiệm trong lĩnh vực cung cấp phụ tùng cơ khí và gia công chính xác.", label: "Giới thiệu ngắn (trang chủ)" },
    { key: "about_full", value: "Với hơn 10 năm hoạt động trong ngành cơ khí...", label: "Giới thiệu đầy đủ", type: "html" },
    { key: "services_description", value: "Xưởng gia công cơ khí chính xác với đầy đủ thiết bị hiện đại: tiện CNC, phay CNC, mài, cắt laser...", label: "Mô tả dịch vụ gia công" },
    { key: "contact_map_embed", value: "", label: "Google Maps embed URL" },
  ];

  for (const c of contents) {
    await prisma.siteContent.upsert({
      where: { key: c.key },
      create: c,
      update: {},
    });
  }
  console.log("✅ Banners & Site content seeded");

  // ============================================================
  // 3. CATALOG SEED (ONLY IF EMPTY)
  // ============================================================
  const skipSeedCSV = process.env.SKIP_SEED_CSV === "true";
  const productCount = await prisma.product.count();
  if (!skipSeedCSV && productCount === 0) {
    console.log(`Chưa có sản phẩm nào trong DB. Bắt đầu seed catalog từ CSV...`);
    await seedCatalogFromCSV();
  } else {
    console.log(`✅ Bỏ qua import CSV (SKIP_SEED_CSV=${skipSeedCSV}, DB có ${productCount} sản phẩm).`);
  }

  console.log("\n🎉 Seed hoàn tất!");
  console.log(`\n📧 Admin login: ${adminEmail}`);
  console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || "Admin@123456"}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
