import { Prisma } from "@prisma/client";

/**
 * Tạo Prisma WhereInput cho tìm kiếm sản phẩm tiếng Việt.
 *
 * Chiến lược:
 * - Tìm chính xác substring (ILIKE) theo name, sku
 * - Tìm từng từ riêng lẻ (word match) để bắt các biến thể
 *
 * Lý do không dùng Prisma built-in `search`:
 * - Prisma FTS (`search`) chỉ hoạt động với `fullTextSearch` preview feature
 *   và provider `mysql`/`mongodb`. PostgreSQL full-text cần raw SQL.
 * - Với quy mô vài trăm đến 1.000 SKU, ILIKE + multi-word OR đủ nhanh.
 */
export function buildSearchFilter(q: string): Prisma.ProductWhereInput | null {
  const trimmed = q.trim();
  if (!trimmed) return null;

  // Tách thành từng từ để tìm kiếm linh hoạt hơn
  const words = trimmed
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6); // Giới hạn tối đa 6 từ để tránh query quá phức tạp

  if (words.length === 0) return null;

  // Mỗi từ phải match ít nhất 1 trong các trường (AND giữa các từ)
  const andClauses: Prisma.ProductWhereInput[] = words.map((word) => ({
    OR: [
      { name: { contains: word, mode: "insensitive" as const } },
      { sku: { contains: word, mode: "insensitive" as const } },
    ],
  }));

  // Nếu chỉ 1 từ → đơn giản, nếu nhiều từ → AND tất cả words
  if (andClauses.length === 1) {
    return andClauses[0];
  }

  return { AND: andClauses };
}
