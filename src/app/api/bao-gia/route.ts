import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  sendQuoteNotificationToAdmin,
  sendQuoteConfirmationToCustomer,
} from "@/lib/mailer";

const quotePayloadSchema = z.object({
  customerName: z.string().min(1, "Vui lòng nhập họ tên"),
  company: z.string().optional().nullable(),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  email: z
    .string()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal(""))
    .nullable(),
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
    const uniqueProductIds = Array.from(
      new Set(payload.items.map((item) => item.productId)),
    );

    // Lấy thông tin sản phẩm (cần name + sku để gửi email)
    const products = await prisma.product.findMany({
      where: { id: { in: uniqueProductIds }, isActive: true },
      select: { id: true, name: true, sku: true },
    });

    if (products.length !== uniqueProductIds.length) {
      return NextResponse.json(
        { error: "Một hoặc nhiều sản phẩm không còn khả dụng" },
        { status: 400 },
      );
    }

    // Tạo map để lookup nhanh
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Lưu vào DB
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

    // Chuẩn bị data email
    const emailData = {
      quoteId: created.id,
      customerName: payload.customerName,
      company: payload.company,
      phone: payload.phone,
      email: payload.email,
      note: payload.note,
      items: payload.items.map((item) => ({
        productName: productMap.get(item.productId)?.name ?? "Sản phẩm",
        sku: productMap.get(item.productId)?.sku ?? "—",
        quantity: item.quantity,
      })),
    };

    // Gửi email song song — không block response nếu email lỗi
    Promise.allSettled([
      sendQuoteNotificationToAdmin(emailData),
      sendQuoteConfirmationToCustomer(emailData),
    ]).then((results) => {
      results.forEach((result, i) => {
        if (result.status === "rejected") {
          console.error(
            `Email ${i === 0 ? "admin" : "customer"} failed:`,
            result.reason,
          );
        }
      });
    });

    return NextResponse.json({ success: true, id: created.id }, { status: 201 });
  } catch (error) {
    console.error("Quote create error:", error);
    return NextResponse.json(
      { error: "Không thể gửi yêu cầu báo giá" },
      { status: 500 },
    );
  }
}
