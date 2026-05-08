"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const bannerSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  subtitle: z.string().optional().nullable(),
  image: z.string().min(1, "Vui lòng chọn ảnh banner"),
  link: z.string().optional().nullable(),
  sortOrder: z.number(),
  isActive: z.boolean(),
});

export async function createBanner(data: z.infer<typeof bannerSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const parsed = bannerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  try {
    await prisma.banner.create({ data: parsed.data });
    revalidatePath("/");
    revalidatePath("/admin/banner");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Không thể tạo banner" };
  }
}

export async function updateBanner(data: z.infer<typeof bannerSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const parsed = bannerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  if (!parsed.data.id) {
    return { error: "Thiếu ID banner" };
  }

  try {
    const { id, ...rest } = parsed.data;
    await prisma.banner.update({ where: { id }, data: rest });
    revalidatePath("/");
    revalidatePath("/admin/banner");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Không thể cập nhật banner" };
  }
}

export async function deleteBanner(id: number) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  try {
    await prisma.banner.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/banner");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Không thể xóa banner" };
  }
}
