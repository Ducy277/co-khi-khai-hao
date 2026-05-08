"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const updateStatusSchema = z.object({
  id: z.number(),
  status: z.enum(["new", "processing", "replied"]),
});

export async function updateQuoteStatus(data: z.infer<typeof updateStatusSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const parsed = updateStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  try {
    await prisma.quoteRequest.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });

    revalidatePath("/admin/bao-gia");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Không thể cập nhật trạng thái" };
  }
}
