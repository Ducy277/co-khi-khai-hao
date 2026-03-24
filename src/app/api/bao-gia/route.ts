import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const quotePayloadSchema = z.object({
  customerName: z.string().min(1, "Vui lòng nhập họ tên"),
  company: z.string().optional().nullable(),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")).nullable(),
  note: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1, "Giỏ báo giá đang trống"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = quotePayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const uniqueProductIds = Array.from(new Set(payload.items.map((item) => item.productId)));

    const products = await prisma.product.findMany({
      where: {
        id: { in: uniqueProductIds },
        isActive: true,
      },
      select: { id: true },
    });

    if (products.length !== uniqueProductIds.length) {
      return NextResponse.json(
        { error: "Một hoặc nhiều sản phẩm không còn khả dụng" },
        { status: 400 },
      );
    }

    const created = await prisma.quoteRequest.create({
      data: {
        customerName: payload.customerName,
        company: payload.company || null,
        phone: payload.phone,
        email: payload.email || null,
        note: payload.note || null,
        items: {
          create: payload.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: created.id }, { status: 201 });
  } catch (error) {
    console.error("Quote create error:", error);
    return NextResponse.json({ error: "Không thể gửi yêu cầu báo giá" }, { status: 500 });
  }
}
