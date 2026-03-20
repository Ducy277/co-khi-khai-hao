"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const optionSchema = z.object({
  id: z.number().optional(),
  attributeId: z.number(),
  value: z.string().min(1, "Giá trị tuỳ chọn không được trống"),
  sortOrder: z.coerce.number().default(0),
});

export async function createOption(data: z.infer<typeof optionSchema>) {
  const result = optionSchema.safeParse(data);
  if (!result.success) return { error: result.error.errors[0].message };

  // Check unique value within the same attribute
  const existing = await prisma.attributeOption.findFirst({
    where: {
      attributeId: result.data.attributeId,
      value: result.data.value,
    }
  });

  if (existing) return { error: "Tuỳ chọn này đã tồn tại trong thuộc tính!" };

  try {
    await prisma.attributeOption.create({
      data: result.data,
    });
    revalidatePath(`/admin/thuoc-tinh/${result.data.attributeId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Có lỗi xảy ra khi thêm tuỳ chọn." };
  }
}

export async function updateOption(data: z.infer<typeof optionSchema>) {
  const result = optionSchema.safeParse(data);
  if (!result.success) return { error: result.error.errors[0].message };
  if (!result.data.id) return { error: "Thiếu ID tuỳ chọn." };

  const existing = await prisma.attributeOption.findFirst({
    where: {
      attributeId: result.data.attributeId,
      value: result.data.value,
      id: { not: result.data.id }
    }
  });

  if (existing) return { error: "Tuỳ chọn này đã tồn tại!" };

  try {
    await prisma.attributeOption.update({
      where: { id: result.data.id },
      data: {
        value: result.data.value,
        sortOrder: result.data.sortOrder,
      },
    });
    revalidatePath(`/admin/thuoc-tinh/${result.data.attributeId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Có lỗi xảy ra khi cập nhật tuỳ chọn." };
  }
}

export async function deleteOption(id: number, attributeId: number) {
  try {
    await prisma.attributeOption.delete({
      where: { id },
    });
    revalidatePath(`/admin/thuoc-tinh/${attributeId}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "Có lỗi xảy ra khi xóa tuỳ chọn." };
  }
}
