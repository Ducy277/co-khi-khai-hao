"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Tên sản phẩm không được trống"),
  slug: z.string().min(1, "Slug không được trống"),
  sku: z.string().min(1, "SKU không được trống"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().optional().nullable(),
  priceOnRequest: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  seoTitle: z.string().optional().nullable(),
  seoDesc: z.string().optional().nullable(),
  categoryId: z.number().min(1, "Vui lòng chọn danh mục"),
  brandId: z.number().optional().nullable(),
  images: z.array(z.object({
    url: z.string(),
    alt: z.string().optional().nullable(),
    isPrimary: z.boolean().default(false),
    sortOrder: z.number().default(0)
  })).default([]),
  attributes: z.record(z.string(), z.string()).optional() // { [attributeId]: value }
});

export async function createProduct(data: z.infer<typeof productSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const result = productSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0]?.message };

  // Check unique slug and SKU
  const existingSlug = await prisma.product.findUnique({ where: { slug: result.data.slug } });
  if (existingSlug) return { error: "Đường dẫn (Slug) này đã tồn tại!" };

  const existingSku = await prisma.product.findUnique({ where: { sku: result.data.sku } });
  if (existingSku) return { error: "Mã sản phẩm (SKU) này đã tồn tại!" };

  try {
    const { images, attributes, ...productData } = result.data;

    // Chuẩn bị mảng thuộc tính
    const attributeValues = attributes 
      ? Object.entries(attributes).map(([attrId, value]) => ({
          attributeId: parseInt(attrId, 10),
          value,
        }))
      : [];

    await prisma.product.create({
      data: {
        ...productData,
        images: {
          create: images.map((img, index) => ({
            ...img,
            sortOrder: img.sortOrder || index,
          }))
        },
        attributeValues: {
          create: attributeValues
        }
      }
    });

    revalidatePath("/admin/san-pham");
    return { success: true };
  } catch (error: unknown) {
    console.error("Lỗi tạo sản phẩm:", error);
    return { error: "Có lỗi xảy ra khi thêm sản phẩm." };
  }
}

export async function updateProduct(data: z.infer<typeof productSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const result = productSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0]?.message };
  if (!result.data.id) return { error: "Thiếu ID sản phẩm." };

  const existingSlug = await prisma.product.findUnique({ 
    where: { slug: result.data.slug }
  });
  if (existingSlug && existingSlug.id !== result.data.id) {
    return { error: "Đường dẫn (Slug) này đã tồn tại!" };
  }

  const existingSku = await prisma.product.findUnique({ 
    where: { sku: result.data.sku }
  });
  if (existingSku && existingSku.id !== result.data.id) {
    return { error: "Mã sản phẩm (SKU) này đã tồn tại!" };
  }

  try {
    const { images, attributes, id, ...productData } = result.data;

    const attributeValues = attributes 
      ? Object.entries(attributes).map(([attrId, value]) => ({
          attributeId: parseInt(attrId, 10),
          value,
        }))
      : [];

    // Transaction for safe update
    await prisma.$transaction(async (tx) => {
      // 1. Cập nhật thông tin cơ bản
      await tx.product.update({
        where: { id },
        data: productData
      });

      // 2. Xử lý ảnh: Cách đơn giản nhất đối với ảnh là xoá hết và tạo lại để tái sử dụng form array dễ dàng
      await tx.productImage.deleteMany({
        where: { productId: id }
      });
      if (images && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img, index) => ({
            ...img,
            productId: id,
            sortOrder: img.sortOrder || index,
          }))
        });
      }

      // 3. Xử lý thuộc tính: Tương tự ảnh, gỡ bỏ tất cả và thêm lại
      await tx.productAttributeValue.deleteMany({
        where: { productId: id }
      });
      if (attributeValues.length > 0) {
        await tx.productAttributeValue.createMany({
          data: attributeValues.map(av => ({
            ...av,
            productId: id
          }))
        });
      }
    });

    revalidatePath("/admin/san-pham");
    revalidatePath(`/admin/san-pham/${id}/edit`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Lỗi cập nhật sản phẩm:", error);
    return { error: "Có lỗi xảy ra khi cập nhật sản phẩm." };
  }
}

export async function deleteProduct(id: number) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/admin/san-pham");
    return { success: true };
  } catch (error: unknown) {
    console.error(error);
    return { error: "Không thể xóa sản phẩm này (Có thể đã được dùng trong Báo giá)." };
  }
}

export async function quickUpdateProduct(
  id: number,
  data: { isFeatured?: boolean; isActive?: boolean; price?: number | null; priceOnRequest?: boolean }
) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  try {
    await prisma.product.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/san-pham");
    return { success: true };
  } catch (error: unknown) {
    console.error(error);
    return { error: "Không thể cập nhật sản phẩm." };
  }
}
