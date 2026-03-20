import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Bắt đầu seed data...");

  // ============================================================
  // 1. ADMIN USER
  // ============================================================
  const adminEmail = process.env.ADMIN_EMAIL || "admin@ckkh.vn";
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
  // 2. BRANDS
  // ============================================================
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: "skf" },
      create: { name: "SKF", slug: "skf", sortOrder: 1 },
      update: {},
    }),
    prisma.brand.upsert({
      where: { slug: "nsk" },
      create: { name: "NSK", slug: "nsk", sortOrder: 2 },
      update: {},
    }),
    prisma.brand.upsert({
      where: { slug: "fag" },
      create: { name: "FAG", slug: "fag", sortOrder: 3 },
      update: {},
    }),
    prisma.brand.upsert({
      where: { slug: "ntn" },
      create: { name: "NTN", slug: "ntn", sortOrder: 4 },
      update: {},
    }),
    prisma.brand.upsert({
      where: { slug: "thuong-hieu-khac" },
      create: { name: "Thương hiệu khác", slug: "thuong-hieu-khac", sortOrder: 99 },
      update: {},
    }),
  ]);
  console.log("✅ Brands created:", brands.length);

  // ============================================================
  // 3. CATEGORIES
  // ============================================================
  // Cha
  const catOBi = await prisma.category.upsert({
    where: { slug: "o-bi" },
    create: {
      name: "Ổ Bi",
      slug: "o-bi",
      description: "Các loại ổ bi chính hãng SKF, NSK, FAG, NTN",
      sortOrder: 1,
    },
    update: {},
  });
  const catBanhRang = await prisma.category.upsert({
    where: { slug: "banh-rang" },
    create: {
      name: "Bánh Răng",
      slug: "banh-rang",
      description: "Bánh răng trụ, bánh răng côn, bánh răng vít me",
      sortOrder: 2,
    },
    update: {},
  });
  const catBuLong = await prisma.category.upsert({
    where: { slug: "bu-long-oc-vit" },
    create: {
      name: "Bu Lông - Ốc Vít",
      slug: "bu-long-oc-vit",
      description: "Bu lông, ốc vít, đai ốc các loại",
      sortOrder: 3,
    },
    update: {},
  });
  const catDayDai = await prisma.category.upsert({
    where: { slug: "day-dai" },
    create: {
      name: "Dây Đai",
      slug: "day-dai",
      description: "Dây đai thang, dây đai răng, dây đai phẳng",
      sortOrder: 4,
    },
    update: {},
  });
  const catKhopNoi = await prisma.category.upsert({
    where: { slug: "khop-noi" },
    create: {
      name: "Khớp Nối",
      slug: "khop-noi",
      description: "Khớp nối trục, khớp nối mềm, khớp nối cứng",
      sortOrder: 5,
    },
    update: {},
  });

  // Con
  const catOBiCau = await prisma.category.upsert({
    where: { slug: "o-bi-cau" },
    create: {
      name: "Ổ Bi Cầu",
      slug: "o-bi-cau",
      description: "Ổ bi cầu 1 dãy, 2 dãy chịu lực hướng tâm",
      parentId: catOBi.id,
      sortOrder: 1,
    },
    update: {},
  });
  const catOBiDua = await prisma.category.upsert({
    where: { slug: "o-bi-dua" },
    create: {
      name: "Ổ Bi Đũa",
      slug: "o-bi-dua",
      description: "Ổ bi đũa trụ, đũa côn chịu tải trọng lớn",
      parentId: catOBi.id,
      sortOrder: 2,
    },
    update: {},
  });
  const catBanhRangTru = await prisma.category.upsert({
    where: { slug: "banh-rang-tru" },
    create: {
      name: "Bánh Răng Trụ",
      slug: "banh-rang-tru",
      parentId: catBanhRang.id,
      sortOrder: 1,
    },
    update: {},
  });

  console.log("✅ Categories created");

  // ============================================================
  // 4. GLOBAL ATTRIBUTES
  // ============================================================
  const upsertGlobalAttr = async (data: {
    name: string; slug: string; type: string; filterType: string; sortOrder: number;
  }) => {
    const existing = await prisma.categoryAttribute.findFirst({
      where: { slug: data.slug, isGlobal: true, categoryId: null },
    });
    if (existing) return existing;
    return prisma.categoryAttribute.create({ data: { ...data, isGlobal: true } });
  };

  const attrBrand = await upsertGlobalAttr({ name: "Thương Hiệu", slug: "thuong-hieu", type: "select", filterType: "checkbox", sortOrder: 1 });
  const attrMaterial = await upsertGlobalAttr({ name: "Vật Liệu", slug: "vat-lieu", type: "select", filterType: "checkbox", sortOrder: 2 });
  const attrOrigin = await upsertGlobalAttr({ name: "Xuất Xứ", slug: "xuat-xu", type: "select", filterType: "checkbox", sortOrder: 3 });

  // Options for global attributes
  await prisma.attributeOption.createMany({
    data: [
      { attributeId: attrMaterial.id, value: "Thép chịu lực", sortOrder: 1 },
      { attributeId: attrMaterial.id, value: "Thép không gỉ (Inox)", sortOrder: 2 },
      { attributeId: attrMaterial.id, value: "Thép carbon", sortOrder: 3 },
      { attributeId: attrMaterial.id, value: "Nhôm", sortOrder: 4 },
      { attributeId: attrOrigin.id, value: "Thụy Điển", sortOrder: 1 },
      { attributeId: attrOrigin.id, value: "Nhật Bản", sortOrder: 2 },
      { attributeId: attrOrigin.id, value: "Đức", sortOrder: 3 },
      { attributeId: attrOrigin.id, value: "Trung Quốc", sortOrder: 4 },
      { attributeId: attrOrigin.id, value: "Việt Nam", sortOrder: 5 },
      { attributeId: attrBrand.id, value: "SKF", sortOrder: 1 },
      { attributeId: attrBrand.id, value: "NSK", sortOrder: 2 },
      { attributeId: attrBrand.id, value: "FAG", sortOrder: 3 },
      { attributeId: attrBrand.id, value: "NTN", sortOrder: 4 },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // 5. CATEGORY-SPECIFIC ATTRIBUTES (Ổ bi cầu)
  // ============================================================
  const attrInnerD = await prisma.categoryAttribute.upsert({
    where: { categoryId_slug: { categoryId: catOBiCau.id, slug: "duong-kinh-trong" } },
    create: {
      name: "Đường Kính Trong",
      slug: "duong-kinh-trong",
      unit: "mm",
      type: "number",
      filterType: "range",
      categoryId: catOBiCau.id,
      sortOrder: 4,
    },
    update: {},
  });
  const attrOuterD = await prisma.categoryAttribute.upsert({
    where: { categoryId_slug: { categoryId: catOBiCau.id, slug: "duong-kinh-ngoai" } },
    create: {
      name: "Đường Kính Ngoài",
      slug: "duong-kinh-ngoai",
      unit: "mm",
      type: "number",
      filterType: "range",
      categoryId: catOBiCau.id,
      sortOrder: 5,
    },
    update: {},
  });
  const attrWidth = await prisma.categoryAttribute.upsert({
    where: { categoryId_slug: { categoryId: catOBiCau.id, slug: "chieu-rong" } },
    create: {
      name: "Chiều Rộng",
      slug: "chieu-rong",
      unit: "mm",
      type: "number",
      filterType: "range",
      categoryId: catOBiCau.id,
      sortOrder: 6,
    },
    update: {},
  });
  const attrShield = await prisma.categoryAttribute.upsert({
    where: { categoryId_slug: { categoryId: catOBiCau.id, slug: "loai-chan" } },
    create: {
      name: "Loại Chắn",
      slug: "loai-chan",
      type: "select",
      filterType: "checkbox",
      categoryId: catOBiCau.id,
      sortOrder: 7,
    },
    update: {},
  });

  await prisma.attributeOption.createMany({
    data: [
      { attributeId: attrShield.id, value: "ZZ (Chắn thép 2 phía)", sortOrder: 1 },
      { attributeId: attrShield.id, value: "2RS (Cao su 2 phía)", sortOrder: 2 },
      { attributeId: attrShield.id, value: "Open (Không chắn)", sortOrder: 3 },
      { attributeId: attrShield.id, value: "RS (Cao su 1 phía)", sortOrder: 4 },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Attributes created");

  // ============================================================
  // 6. SAMPLE PRODUCTS (Ổ bi cầu)
  // ============================================================
  const skfBrand = brands[0]; // SKF
  const nskBrand = brands[1]; // NSK

  const products = [
    {
      name: "Ổ Bi Cầu 6205-2RS SKF",
      slug: "o-bi-cau-6205-2rs-skf",
      sku: "SKF-6205-2RS",
      description:
        "Ổ bi cầu 6205-2RS chính hãng SKF - Thụy Điển. Phù hợp cho máy bơm, motor điện, hộp số tốc độ cao. Chắn cao su 2 phía, bôi trơn sẵn với mỡ.",
      price: 85000,
      priceOnRequest: false,
      isFeatured: true,
      categoryId: catOBiCau.id,
      brandId: skfBrand.id,
      attrs: [
        { attrId: attrInnerD.id, value: "25" },
        { attrId: attrOuterD.id, value: "52" },
        { attrId: attrWidth.id, value: "15" },
        { attrId: attrShield.id, value: "2RS (Cao su 2 phía)" },
        { attrId: attrBrand.id, value: "SKF" },
        { attrId: attrMaterial.id, value: "Thép chịu lực" },
        { attrId: attrOrigin.id, value: "Thụy Điển" },
      ],
    },
    {
      name: "Ổ Bi Cầu 6205-ZZ SKF",
      slug: "o-bi-cau-6205-zz-skf",
      sku: "SKF-6205-ZZ",
      description:
        "Ổ bi cầu 6205-ZZ chính hãng SKF. Chắn thép 2 phía, phù hợp môi trường bụi bẩn, nhiệt độ cao.",
      price: 82000,
      priceOnRequest: false,
      isFeatured: false,
      categoryId: catOBiCau.id,
      brandId: skfBrand.id,
      attrs: [
        { attrId: attrInnerD.id, value: "25" },
        { attrId: attrOuterD.id, value: "52" },
        { attrId: attrWidth.id, value: "15" },
        { attrId: attrShield.id, value: "ZZ (Chắn thép 2 phía)" },
        { attrId: attrBrand.id, value: "SKF" },
        { attrId: attrMaterial.id, value: "Thép chịu lực" },
        { attrId: attrOrigin.id, value: "Thụy Điển" },
      ],
    },
    {
      name: "Ổ Bi Cầu 6305-2RS NSK",
      slug: "o-bi-cau-6305-2rs-nsk",
      sku: "NSK-6305-2RS",
      description:
        "Ổ bi cầu 6305-2RS NSK chính hãng Nhật Bản. Tải trọng cao hơn 6205 cùng đường kính trong.",
      price: 95000,
      priceOnRequest: false,
      isFeatured: true,
      categoryId: catOBiCau.id,
      brandId: nskBrand.id,
      attrs: [
        { attrId: attrInnerD.id, value: "25" },
        { attrId: attrOuterD.id, value: "62" },
        { attrId: attrWidth.id, value: "17" },
        { attrId: attrShield.id, value: "2RS (Cao su 2 phía)" },
        { attrId: attrBrand.id, value: "NSK" },
        { attrId: attrMaterial.id, value: "Thép chịu lực" },
        { attrId: attrOrigin.id, value: "Nhật Bản" },
      ],
    },
    {
      name: "Ổ Bi Cầu 6208-2RS SKF",
      slug: "o-bi-cau-6208-2rs-skf",
      sku: "SKF-6208-2RS",
      description:
        "Ổ bi cầu 6208-2RS SKF đường kính trong 40mm. Dùng phổ biến trong công nghiệp dệt, thực phẩm.",
      price: 145000,
      priceOnRequest: false,
      isFeatured: true,
      categoryId: catOBiCau.id,
      brandId: skfBrand.id,
      attrs: [
        { attrId: attrInnerD.id, value: "40" },
        { attrId: attrOuterD.id, value: "80" },
        { attrId: attrWidth.id, value: "18" },
        { attrId: attrShield.id, value: "2RS (Cao su 2 phía)" },
        { attrId: attrBrand.id, value: "SKF" },
        { attrId: attrMaterial.id, value: "Thép chịu lực" },
        { attrId: attrOrigin.id, value: "Thụy Điển" },
      ],
    },
    {
      name: "Ổ Bi Cầu 6010-Open NSK",
      slug: "o-bi-cau-6010-open-nsk",
      sku: "NSK-6010-OPEN",
      description:
        "Ổ bi cầu 6010 không chắn NSK. Phù hợp cho ứng dụng cần thêm mỡ định kỳ.",
      price: 0,
      priceOnRequest: true,
      isFeatured: false,
      categoryId: catOBiCau.id,
      brandId: nskBrand.id,
      attrs: [
        { attrId: attrInnerD.id, value: "50" },
        { attrId: attrOuterD.id, value: "80" },
        { attrId: attrWidth.id, value: "16" },
        { attrId: attrShield.id, value: "Open (Không chắn)" },
        { attrId: attrBrand.id, value: "NSK" },
        { attrId: attrMaterial.id, value: "Thép chịu lực" },
        { attrId: attrOrigin.id, value: "Nhật Bản" },
      ],
    },
  ];

  for (const p of products) {
    const { attrs, ...productData } = p;
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      create: {
        ...productData,
        price: productData.priceOnRequest ? null : productData.price,
      },
      update: {},
    });

    for (const attr of attrs) {
      await prisma.productAttributeValue.upsert({
        where: { productId_attributeId: { productId: product.id, attributeId: attr.attrId } },
        create: { productId: product.id, attributeId: attr.attrId, value: attr.value },
        update: { value: attr.value },
      });
    }
  }

  console.log("✅ Products created:", products.length);

  // ============================================================
  // 7. BANNERS
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

  // ============================================================
  // 8. SITE CONTENT
  // ============================================================
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

  console.log("✅ Site content seeded");
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
