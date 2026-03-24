export const QUOTE_CART_STORAGE_KEY = "ckkh_quote_cart_v1";
export const QUOTE_CART_EVENT = "quote-cart-updated";

export type QuoteCartItem = {
  productId: number;
  name: string;
  slug: string;
  sku: string;
  price: number | null;
  priceOnRequest: boolean;
  imageUrl?: string;
  quantity: number;
};

export type QuoteCart = {
  items: QuoteCartItem[];
  updatedAt: string;
};

const emptyCart = (): QuoteCart => ({
  items: [],
  updatedAt: new Date().toISOString(),
});

function emitQuoteCartUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(QUOTE_CART_EVENT));
}

export function getQuoteCart(): QuoteCart {
  if (typeof window === "undefined") return emptyCart();

  const raw = window.localStorage.getItem(QUOTE_CART_STORAGE_KEY);
  if (!raw) return emptyCart();

  try {
    const parsed = JSON.parse(raw) as QuoteCart;
    if (!parsed || !Array.isArray(parsed.items)) return emptyCart();

    return {
      items: parsed.items,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return emptyCart();
  }
}

export function setQuoteCart(items: QuoteCartItem[]) {
  if (typeof window === "undefined") return;

  const payload: QuoteCart = {
    items,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(QUOTE_CART_STORAGE_KEY, JSON.stringify(payload));
  emitQuoteCartUpdated();
}

export function clearQuoteCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(QUOTE_CART_STORAGE_KEY);
  emitQuoteCartUpdated();
}

export function addItemToQuoteCart(item: Omit<QuoteCartItem, "quantity"> & { quantity?: number }) {
  const cart = getQuoteCart();
  const qty = Math.max(1, item.quantity ?? 1);

  const existingIndex = cart.items.findIndex((i) => i.productId === item.productId);
  if (existingIndex >= 0) {
    const updated = [...cart.items];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + qty,
    };
    setQuoteCart(updated);
    return;
  }

  setQuoteCart([
    ...cart.items,
    {
      ...item,
      quantity: qty,
    },
  ]);
}

export function updateItemQuantity(productId: number, quantity: number) {
  const cart = getQuoteCart();
  const nextQty = Math.max(1, quantity);

  setQuoteCart(
    cart.items.map((item) =>
      item.productId === productId ? { ...item, quantity: nextQty } : item,
    ),
  );
}

export function removeItemFromQuoteCart(productId: number) {
  const cart = getQuoteCart();
  setQuoteCart(cart.items.filter((item) => item.productId !== productId));
}

export function getQuoteCartCount() {
  const cart = getQuoteCart();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
