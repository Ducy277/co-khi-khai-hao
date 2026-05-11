import { describe, it, expect } from "vitest";
import { z } from "zod";

// Trích xuất schema từ route, không import cả route (tránh kéo theo Prisma/Next.js)
// Schema này là bản copy chính xác từ src/app/api/bao-gia/route.ts
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

// ── Helper ─────────────────────────────────────────────────────────────────────
const validPayload = {
  customerName: "Nguyễn Văn A",
  phone: "0901234567",
  items: [{ productId: 1, quantity: 2 }],
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("quotePayloadSchema — Validation", () => {
  it("payload hợp lệ đầy đủ → success: true", () => {
    const result = quotePayloadSchema.safeParse({
      ...validPayload,
      company: "Công ty ",
      email: "test@example.com",
      note: "Giao hàng sáng",
    });
    expect(result.success).toBe(true);
  });

  it("payload tối thiểu (chỉ name, phone, items) → hợp lệ", () => {
    const result = quotePayloadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("thiếu customerName → lỗi validation", () => {
    const result = quotePayloadSchema.safeParse({
      phone: "0901234567",
      items: [{ productId: 1, quantity: 1 }],
    });
    expect(result.success).toBe(false);
    // Khi thiếu hoàn toàn field, Zod trả về lỗi kiểu Required
    if (!result.success) {
      const path = result.error.issues[0]?.path;
      expect(path).toContain("customerName");
    }
  });

  it("customerName rỗng '' → lỗi validation", () => {
    const result = quotePayloadSchema.safeParse({
      ...validPayload,
      customerName: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Vui lòng nhập họ tên");
    }
  });

  it("thiếu phone → lỗi validation", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { phone: _phone, ...withoutPhone } = { ...validPayload, phone: undefined as unknown as string };
    const result = quotePayloadSchema.safeParse(withoutPhone);
    expect(result.success).toBe(false);
  });

  it("phone rỗng '' → lỗi validation", () => {
    const result = quotePayloadSchema.safeParse({ ...validPayload, phone: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Vui lòng nhập số điện thoại");
    }
  });

  it("items rỗng [] → lỗi 'Giỏ hàng đang trống'", () => {
    const result = quotePayloadSchema.safeParse({ ...validPayload, items: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Giỏ hàng đang trống");
    }
  });

  it("items[].quantity = 0 → lỗi validation (min 1)", () => {
    const result = quotePayloadSchema.safeParse({
      ...validPayload,
      items: [{ productId: 1, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("items[].quantity âm → lỗi validation", () => {
    const result = quotePayloadSchema.safeParse({
      ...validPayload,
      items: [{ productId: 1, quantity: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it("email không hợp lệ → lỗi 'Email không hợp lệ'", () => {
    const result = quotePayloadSchema.safeParse({
      ...validPayload,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email không hợp lệ");
    }
  });

  it("email là chuỗi rỗng '' → HỢP LỆ (optional)", () => {
    const result = quotePayloadSchema.safeParse({ ...validPayload, email: "" });
    expect(result.success).toBe(true);
  });

  it("email là null → hợp lệ (nullable)", () => {
    const result = quotePayloadSchema.safeParse({ ...validPayload, email: null });
    expect(result.success).toBe(true);
  });

  it("company và note là optional → có thể bỏ qua", () => {
    const result = quotePayloadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company).toBeUndefined();
      expect(result.data.note).toBeUndefined();
    }
  });

  it("nhiều items trong một order → hợp lệ", () => {
    const result = quotePayloadSchema.safeParse({
      ...validPayload,
      items: [
        { productId: 1, quantity: 5 },
        { productId: 2, quantity: 10 },
        { productId: 3, quantity: 1 },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(3);
    }
  });
});
