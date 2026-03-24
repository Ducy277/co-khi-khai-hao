"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const attributeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Tên thuộc tính không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
  unit: z.string().optional().nullable(),
  type: z.enum(["text", "number", "select"]),
  filterType: z.enum(["checkbox", "range", "dropdown", "none"]),
  isGlobal: z.boolean().default(false),
  isRequired: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
  categoryId: z.number().nullable().optional(),
  isActive: z.boolean().default(true),
});

export async function createAttribute(data: z.infer<typeof attributeSchema>) {
  const result = attributeSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0]?.message };

  if (!result.data.isGlobal && !result.data.categoryId) {
    return { error: "Thuộc tính không phải Toàn cục bắt buộc phải chọn Danh mục!" };
  }

  // Custom unique check
  const match = await prisma.categoryAttribute.findFirst({
    where: {
      slug: result.data.slug,
      categoryId: result.data.isGlobal ? null : result.data.categoryId,
    }
  });

  if (match) return { error: "Slug này đã tồn tại trong danh mục được chọn (hoặc ở mức Toàn cục)!" };

  try {
    const payload = { ...result.data };
    if (payload.isGlobal) payload.categoryId = null;

    await prisma.categoryAttribute.create({
      data: payload,
    });
    revalidatePath("/admin/thuoc-tinh");
    return { success: true };
  } catch (error: unknown) {
    console.error(error);
    return { error: "Có lỗi xảy ra khi thêm thuộc tính." };
  }
}

export async function updateAttribute(data: z.infer<typeof attributeSchema>) {
  const result = attributeSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0]?.message };
  if (!result.data.id) return { error: "Thiếu ID thuộc tính." };

  if (!result.data.isGlobal && !result.data.categoryId) {
    return { error: "Thuộc tính không phải Toàn cục bắt buộc phải chọn Danh mục!" };
  }

  const match = await prisma.categoryAttribute.findFirst({
    where: {
      slug: result.data.slug,
      categoryId: result.data.isGlobal ? null : result.data.categoryId,
      id: { not: result.data.id }
    }
  });

  if (match) return { error: "Slug này đã tồn tại trong danh mục được chọn (hoặc ở mức Toàn cục)!" };

  try {
    const payload = { ...result.data };
    if (payload.isGlobal) payload.categoryId = null;

    await prisma.categoryAttribute.update({
      where: { id: result.data.id },
      data: payload,
    });
    revalidatePath("/admin/thuoc-tinh");
    return { success: true };
  } catch (error: unknown) {
    console.error(error);
    return { error: "Có lỗi xảy ra khi cập nhật thuộc tính." };
  }
}

export async function deleteAttribute(id: number) {
  try {
    await prisma.categoryAttribute.delete({
      where: { id },
    });
    revalidatePath("/admin/thuoc-tinh");
    return { success: true };
  } catch (error: unknown) {
    console.error(error);
    return { error: "Không thể xóa thuộc tính này (có thể đang được dùng cho sản phẩm)." };
  }
}
