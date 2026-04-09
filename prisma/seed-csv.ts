import prisma from "../src/lib/prisma";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

// Hàm tạo slug từ string tiếng Việt
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

// Cấu trúc dữ liệu trong CSV
interface CSVRow {
  "SKU": string;
  "Danh mục": string;
  "Danh mục con": string;
  "Tên sản phẩm": string;
  "Thông số kỹ thuật": string;
  "Xuất xứ": string;
  "Giá (VNĐ)": string;
}

async function main() {
  console.log("Starting CSV import...");

  const csvFilePath = path.join(__dirname, "..", "..", "san_pham_chuan_hoa.csv");
  if (!fs.existsSync(csvFilePath)) {
    console.error(`File not found: ${csvFilePath}`);
    process.exit(1);
  }

  const csvData = fs.readFileSync(csvFilePath, "utf8");

  const parsed = Papa.parse<CSVRow>(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.error("Errors while parsing CSV:", parsed.errors);
    process.exit(1);
  }

  console.log(`Parsed ${parsed.data.length} rows.`);

  // 1. CLEAR EXISTING DATA
  console.log("Clearing existing catalog database...");
  await prisma.quoteRequestItem.deleteMany({});
  await prisma.productAttributeValue.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.attributeOption.deleteMany({});
  await prisma.categoryAttribute.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});
  console.log("Cleared database.");

  // Dùng cache để map
  const categoryMap = new Map<string, number>(); // slug -> id
  const brandMap = new Map<string, number>(); // slug -> id
  const attributeMap = new Map<string, { id: number; options: Set<string>; type: string }>(); // attrSlug -> {id, options, type}

  // 2. CREATE CATEGORIES
  console.log("Creating categories...");
  for (const row of parsed.data) {
    const l1Name = row["Danh mục"]?.trim();
    const l2Name = row["Danh mục con"]?.trim();

    if (!l1Name) continue;

    const l1Slug = slugify(l1Name);
    if (!categoryMap.has(l1Slug)) {
      const l1Cat = await prisma.category.create({
        data: {
          name: l1Name,
          slug: l1Slug,
          // attributes for this category will be handled below
        },
      });
      categoryMap.set(l1Slug, l1Cat.id);
    }

    if (l2Name) {
      const l2Slug = slugify(l2Name);
      if (!categoryMap.has(l2Slug)) {
        const l1Id = categoryMap.get(l1Slug)!;
        const l2Cat = await prisma.category.create({
          data: {
            name: l2Name,
            slug: `${l1Slug}-${l2Slug}`,
            parentId: l1Id,
          },
        });
        categoryMap.set(l2Slug, l2Cat.id);
      }
    }
  }

  // 3. CREATE BRANDS
  console.log("Creating brands...");
  for (const row of parsed.data) {
    let brandName = row["Xuất xứ"]?.trim();
    if (!brandName) brandName = "No Brand";

    const brandSlug = slugify(brandName);
    if (!brandMap.has(brandSlug)) {
      const brand = await prisma.brand.create({
        data: {
          name: brandName === "No Brand" ? "Không rõ" : brandName,
          slug: brandSlug,
        },
      });
      brandMap.set(brandSlug, brand.id);
    }
  }



  // 4. PRE-PROCESS ATTRIBUTES
  // We attach attributes to the Level 1 category.
  console.log("Analyzing attributes...");
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
        const attrValue = parts.slice(1).join(":").trim(); // in case value has colon
        
        const attrSlug = slugify(attrName);
        const compositeKey = `${l1Id}_${attrSlug}`; // unique attribute per category

        if (!rawAttributes.has(compositeKey)) {
          rawAttributes.set(compositeKey, {
            name: attrName,
            categoryId: l1Id,
            options: new Set(),
          });
        }
        
        if (attrValue) {
          rawAttributes.get(compositeKey)!.options.add(attrValue);
        }
      }
    }
  }

  console.log("Creating attributes & options...");
  for (const [compositeKey, meta] of Array.from(rawAttributes.entries())) {
    const friendlySlug = slugify(meta.name);
    const type = "select";
    const filterType = "checkbox";

    const attr = await prisma.categoryAttribute.create({
      data: {
        name: meta.name,
        slug: friendlySlug,
        type: type,
        filterType: filterType,
        isGlobal: false,
        categoryId: meta.categoryId,
        options: {
          create: Array.from(meta.options).map((opt, idx) => ({
            value: opt,
            sortOrder: idx,
          })),
        },
      },
      include: { options: true }
    });

    attributeMap.set(compositeKey, { 
      id: attr.id, 
      options: new Set(attr.options.map(o => o.value)),
      type: attr.type 
    });
  }

  // 5. IMPORT PRODUCTS
  console.log("Importing products...");
  const BATCH_SIZE = 500;
  
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

    // We will assign product to the deepest level category
    const categoryIdForProduct = l2Id || l1Id;
    if (!categoryIdForProduct) continue;

    // create product first (because we need its ID for ProductAttributeValue)
    // we can create in a loop since we need relation, or we can use Promise.all batches
    
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
            attrValuesToCreate.push({
              attributeId: attrDef.id,
              value: attrValue
            });
          }
        }
      }
    }

    const slug = slugify(name);
    // ensure unique slug
    try {
      await prisma.product.create({
        data: {
          name: name,
          slug: `${slug}-${sku}`,
          sku: sku,
          price: priceNum,
          priceOnRequest: priceOnRequest,
          categoryId: categoryIdForProduct,
          brandId: brandId,
          attributeValues: {
            create: attrValuesToCreate,
          }
        }
      });
    } catch (e: unknown) {
      console.error(`Error importing row ${i} (SKU: ${sku}): ${(e as Error).message}`);
    }

    if (i % BATCH_SIZE === 0 && i > 0) {
      console.log(`...imported ${i} products.`);
    }
  }

  console.log("Import completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
