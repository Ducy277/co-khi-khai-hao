import { describe, it, expect } from "vitest";
import { buildSearchFilter } from "@/lib/search";

describe("buildSearchFilter", () => {
  // ── NULL CASES ──────────────────────────────────────────────────────────────

  it("trả về null khi chuỗi rỗng", () => {
    expect(buildSearchFilter("")).toBeNull();
  });

  it("trả về null khi chỉ có khoảng trắng", () => {
    expect(buildSearchFilter("   ")).toBeNull();
  });

  // ── SINGLE WORD ─────────────────────────────────────────────────────────────

  it("1 từ → trả về OR filter trực tiếp (không bọc AND)", () => {
    const result = buildSearchFilter("bi");
    expect(result).toEqual({
      OR: [
        { name: { contains: "bi", mode: "insensitive" } },
        { sku: { contains: "bi", mode: "insensitive" } },
      ],
    });
  });

  // ── MULTI-WORD ───────────────────────────────────────────────────────────────

  it("nhiều từ → trả về AND array với mỗi phần tử là OR", () => {
    const result = buildSearchFilter("ổ bi cầu");
    expect(result).toEqual({
      AND: [
        {
          OR: [
            { name: { contains: "ổ", mode: "insensitive" } },
            { sku: { contains: "ổ", mode: "insensitive" } },
          ],
        },
        {
          OR: [
            { name: { contains: "bi", mode: "insensitive" } },
            { sku: { contains: "bi", mode: "insensitive" } },
          ],
        },
        {
          OR: [
            { name: { contains: "cầu", mode: "insensitive" } },
            { sku: { contains: "cầu", mode: "insensitive" } },
          ],
        },
      ],
    });
  });

  it("chuỗi 2 từ → AND array với 2 phần tử", () => {
    const result = buildSearchFilter("6205 SKF") as { AND: unknown[] };
    expect(result).toHaveProperty("AND");
    expect(result.AND).toHaveLength(2);
  });

  // ── WORD LIMIT ───────────────────────────────────────────────────────────────

  it("giới hạn tối đa 6 từ — từ thứ 7 bị cắt bỏ", () => {
    const q = "a b c d e f g h"; // 8 từ
    const result = buildSearchFilter(q) as { AND: unknown[] };
    expect(result).toHaveProperty("AND");
    expect(result.AND).toHaveLength(6);
  });

  // ── WHITESPACE NORMALIZATION ─────────────────────────────────────────────────

  it("khoảng trắng thừa giữa các từ → xử lý đúng", () => {
    const result = buildSearchFilter("  ổ   bi  ") as { AND: unknown[] };
    expect(result).toHaveProperty("AND");
    expect(result.AND).toHaveLength(2);
  });

  it("kết hợp SKU style — vẫn trả về filter chính xác", () => {
    const result = buildSearchFilter("NSK-6205");
    expect(result).not.toBeNull();
    // 1 từ (không có khoảng trắng) → OR trực tiếp
    expect(result).toHaveProperty("OR");
  });
});
