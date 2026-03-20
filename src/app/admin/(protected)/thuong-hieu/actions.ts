"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const brandSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Tên thương hiệu không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
  sortOrder: z.number().default(0),
});

export async function createBrand(data: z.infer<typeof brandSchema>) {
  const result = brandSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const existing = await prisma.brand.findUnique({
    where: { slug: result.data.slug },
  });

  if (existing) {
    return { error: "Slug (đường dẫn) này đã tồn tại!" };
  }

  try {
    await prisma.brand.create({
      data: result.data,
    });
    revalidatePath("/admin/thuong-hieu");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Có lỗi xảy ra khi thêm thương hiệu." };
  }
}

export async function updateBrand(data: z.infer<typeof brandSchema>) {
  const result = brandSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  if (!result.data.id) return { error: "Thiếu ID thương hiệu." };

  const existing = await prisma.brand.findUnique({
    where: { slug: result.data.slug },
  });

  if (existing && existing.id !== result.data.id) {
    return { error: "Slug (đường dẫn) này đã được sử dụng bởi thương hiệu khác!" };
  }

  try {
    await prisma.brand.update({
      where: { id: result.data.id },
      data: {
        name: result.data.name,
        slug: result.data.slug,
        sortOrder: result.data.sortOrder,
      },
    });
    revalidatePath("/admin/thuong-hieu");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Có lỗi xảy ra khi cập nhật thương hiệu." };
  }
}

export async function deleteBrand(id: number) {
  try {
    // Check constraints (bỏ check category liên kết tạm thời, hoặc xoá thẳng nếu prisma có set cascade)
    // Tạm thời nếu có products liên kết thì xoá sẽ báo lỗi do khoá ngoại
    await prisma.brand.delete({
      where: { id },
    });
    revalidatePath("/admin/thuong-hieu");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2003") {
      return { error: "Không thể xóa thương hiệu này vì đang có sản phẩm liên kết!" };
    }
    return { error: "Có lỗi xảy ra khi xóa thương hiệu." };
  }
}
