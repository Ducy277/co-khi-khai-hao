"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const contentSchema = z.object({
  id: z.number().optional(),
  key: z.string().min(1, "Key không được để trống"),
  value: z.string().min(1, "Nội dung không được để trống"),
  type: z.enum(["text", "html", "image"]).default("text"),
  label: z.string().optional().nullable(),
});

export async function createSiteContent(data: z.infer<typeof contentSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const parsed = contentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  const exists = await prisma.siteContent.findUnique({ where: { key: parsed.data.key } });
  if (exists) {
    return { error: "Key này đã tồn tại" };
  }

  try {
    await prisma.siteContent.create({ data: parsed.data });
    revalidatePath("/gioi-thieu");
    revalidatePath("/dich-vu");
    revalidatePath("/lien-he");
    revalidatePath("/admin/noi-dung");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Không thể tạo nội dung" };
  }
}

export async function updateSiteContent(data: z.infer<typeof contentSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const parsed = contentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }
  if (!parsed.data.id) {
    return { error: "Thiếu ID nội dung" };
  }

  const duplicate = await prisma.siteContent.findFirst({
    where: {
      key: parsed.data.key,
      id: { not: parsed.data.id },
    },
  });
  if (duplicate) {
    return { error: "Key này đã được sử dụng" };
  }

  try {
    const { id, ...rest } = parsed.data;
    await prisma.siteContent.update({ where: { id }, data: rest });
    revalidatePath("/gioi-thieu");
    revalidatePath("/dich-vu");
    revalidatePath("/lien-he");
    revalidatePath("/admin/noi-dung");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Không thể cập nhật nội dung" };
  }
}

export async function deleteSiteContent(id: number) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  try {
    await prisma.siteContent.delete({ where: { id } });
    revalidatePath("/gioi-thieu");
    revalidatePath("/dich-vu");
    revalidatePath("/lien-he");
    revalidatePath("/admin/noi-dung");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Không thể xóa nội dung" };
  }
}
