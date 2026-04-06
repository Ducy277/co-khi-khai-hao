import { describe, it, expect, beforeEach, vi } from "vitest";

// ── Mock localStorage trước khi import module ────────────────────────────────
// quote-cart.ts check typeof window !== "undefined" → cần mock window
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

// Giả lập môi trường browser (window + localStorage + dispatchEvent)
vi.stubGlobal("window", {
  localStorage: localStorageMock,
  dispatchEvent: vi.fn(),
});

// Import SAU khi mock window
import {
  addItemToQuoteCart,
  updateItemQuantity,
  removeItemFromQuoteCart,
  getQuoteCart,
  getQuoteCartCount,
  clearQuoteCart,
  QUOTE_CART_STORAGE_KEY,
} from "@/lib/quote-cart";

// ── Helper ─────────────────────────────────────────────────────────────────────
const mockItem = (productId: number, qty?: number) => ({
  productId,
  name: `Sản phẩm ${productId}`,
  slug: `san-pham-${productId}`,
  sku: `SKU-${productId}`,
  price: null,
  priceOnRequest: true,
  quantity: qty ?? 1,
});

// ── Setup ──────────────────────────────────────────────────────────────────────
beforeEach(() => {
  localStorageMock.clear();
  localStorageMock.getItem.mockImplementation((key: string) => {
    return (localStorageMock as unknown as { _store: Record<string, string> })
      ._store?.[key] ?? null;
  });

  // Reset store sạch sẽ
  let store: Record<string, string> = {};
  localStorageMock.getItem.mockImplementation((key: string) => store[key] ?? null);
  localStorageMock.setItem.mockImplementation((key: string, val: string) => { store[key] = val; });
  localStorageMock.removeItem.mockImplementation((key: string) => { delete store[key]; });
  localStorageMock.clear.mockImplementation(() => { store = {}; });
});

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("getQuoteCart", () => {
  it("trả về giỏ rỗng khi localStorage chưa có dữ liệu", () => {
    const cart = getQuoteCart();
    expect(cart.items).toEqual([]);
  });

  it("trả về giỏ rỗng khi localStorage chứa JSON lỗi", () => {
    localStorageMock.setItem(QUOTE_CART_STORAGE_KEY, "{ invalid json !!!");
    const cart = getQuoteCart();
    expect(cart.items).toEqual([]);
  });

  it("trả về giỏ rỗng khi dữ liệu không có trường items", () => {
    localStorageMock.setItem(QUOTE_CART_STORAGE_KEY, JSON.stringify({ foo: "bar" }));
    const cart = getQuoteCart();
    expect(cart.items).toEqual([]);
  });
});

describe("addItemToQuoteCart", () => {
  it("thêm sản phẩm mới vào giỏ rỗng", () => {
    addItemToQuoteCart(mockItem(1));
    const cart = getQuoteCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId).toBe(1);
    expect(cart.items[0].quantity).toBe(1);
  });

  it("thêm cùng sản phẩm 2 lần → cộng dồn số lượng", () => {
    addItemToQuoteCart(mockItem(1, 2));
    addItemToQuoteCart(mockItem(1, 3));
    const cart = getQuoteCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(5); // 2 + 3
  });

  it("thêm với quantity âm → clamp thành 1", () => {
    addItemToQuoteCart({ ...mockItem(1), quantity: -5 });
    const cart = getQuoteCart();
    expect(cart.items[0].quantity).toBe(1);
  });

  it("thêm với quantity = 0 → clamp thành 1", () => {
    addItemToQuoteCart({ ...mockItem(1), quantity: 0 });
    const cart = getQuoteCart();
    expect(cart.items[0].quantity).toBe(1);
  });

  it("thêm 2 sản phẩm khác nhau → giỏ có 2 items", () => {
    addItemToQuoteCart(mockItem(1));
    addItemToQuoteCart(mockItem(2));
    const cart = getQuoteCart();
    expect(cart.items).toHaveLength(2);
  });
});

describe("updateItemQuantity", () => {
  it("cập nhật số lượng hợp lệ", () => {
    addItemToQuoteCart(mockItem(1, 1));
    updateItemQuantity(1, 5);
    const cart = getQuoteCart();
    expect(cart.items[0].quantity).toBe(5);
  });

  it("cập nhật quantity = 0 → clamp thành 1 (không xoá item)", () => {
    addItemToQuoteCart(mockItem(1, 3));
    updateItemQuantity(1, 0);
    const cart = getQuoteCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(1);
  });

  it("cập nhật quantity âm → clamp thành 1", () => {
    addItemToQuoteCart(mockItem(1, 3));
    updateItemQuantity(1, -10);
    const cart = getQuoteCart();
    expect(cart.items[0].quantity).toBe(1);
  });
});

describe("removeItemFromQuoteCart", () => {
  it("xoá đúng sản phẩm theo productId", () => {
    addItemToQuoteCart(mockItem(1));
    addItemToQuoteCart(mockItem(2));
    removeItemFromQuoteCart(1);
    const cart = getQuoteCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId).toBe(2);
  });

  it("xoá productId không tồn tại → không gây lỗi, giỏ giữ nguyên", () => {
    addItemToQuoteCart(mockItem(1));
    removeItemFromQuoteCart(999);
    const cart = getQuoteCart();
    expect(cart.items).toHaveLength(1);
  });
});

describe("getQuoteCartCount", () => {
  it("đếm đúng tổng số lượng khi giỏ rỗng", () => {
    expect(getQuoteCartCount()).toBe(0);
  });

  it("đếm đúng tổng số lượng nhiều items", () => {
    addItemToQuoteCart(mockItem(1, 3));
    addItemToQuoteCart(mockItem(2, 7));
    expect(getQuoteCartCount()).toBe(10);
  });
});

describe("clearQuoteCart", () => {
  it("xoá toàn bộ giỏ hàng", () => {
    addItemToQuoteCart(mockItem(1, 5));
    clearQuoteCart();
    const cart = getQuoteCart();
    expect(cart.items).toEqual([]);
  });
});
