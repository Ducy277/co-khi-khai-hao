"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const categorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Tên danh mục không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
  description: z.string().optional().nullable(),
  parentId: z.number().nullable().optional(),
  sortOrder: z.number().default(0),
});

export async function createCategory(data: z.infer<typeof categorySchema>) {
  const result = categorySchema.safeParse(data);
  if (!result.success) return { error: result.error.errors[0].message };

  const existing = await prisma.category.findUnique({
    where: { slug: result.data.slug },
  });

  if (existing) return { error: "Slug này đã tồn tại!" };

  try {
    await prisma.category.create({
      data: {
        name: result.data.name,
        slug: result.data.slug,
        description: result.data.description || null,
        parentId: result.data.parentId || null,
        sortOrder: result.data.sortOrder,
      },
    });
    revalidatePath("/admin/danh-muc");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Có lỗi xảy ra khi thêm danh mục." };
  }
}

export async function updateCategory(data: z.infer<typeof categorySchema>) {
  const result = categorySchema.safeParse(data);
  if (!result.success) return { error: result.error.errors[0].message };
  if (!result.data.id) return { error: "Thiếu ID danh mục." };

  // Ngăn danh mục chọn chính nó làm cha
  if (result.data.parentId === result.data.id) {
    return { error: "Danh mục không thể chọn chính nó làm danh mục cha!" };
  }

  const existing = await prisma.category.findUnique({
    where: { slug: result.data.slug },
  });

  if (existing && existing.id !== result.data.id) {
    return { error: "Slug này đã được sử dụng bởi danh mục khác!" };
  }

  try {
    await prisma.category.update({
      where: { id: result.data.id },
      data: {
        name: result.data.name,
        slug: result.data.slug,
        description: result.data.description || null,
        parentId: result.data.parentId || null,
        sortOrder: result.data.sortOrder,
      },
    });
    revalidatePath("/admin/danh-muc");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Có lỗi xảy ra khi cập nhật danh mục." };
  }
}

export async function deleteCategory(id: number) {
  try {
    // Check if category has children
    const children = await prisma.category.count({ where: { parentId: id } });
    if (children > 0) {
      return { error: "Không thể xóa danh mục này vì đang có danh mục con!" };
    }

    // Attempt to delete
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath("/admin/danh-muc");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2003") {
      return { error: "Không thể xóa danh mục này vì đang có sản phẩm hoặc thuộc tính liên kết!" };
    }
    return { error: "Có lỗi xảy ra khi xóa danh mục." };
  }
}
