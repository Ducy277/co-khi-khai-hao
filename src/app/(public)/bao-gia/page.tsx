"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Trash2, ShoppingBag, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  QuoteCartItem,
  clearQuoteCart,
  getQuoteCart,
  QUOTE_CART_EVENT,
  removeItemFromQuoteCart,
  updateItemQuantity,
} from "@/lib/quote-cart";

type QuoteForm = {
  customerName: string;
  company: string;
  phone: string;
  email: string;
  note: string;
};

const initialForm: QuoteForm = {
  customerName: "",
  company: "",
  phone: "",
  email: "",
  note: "",
};

export default function QuoteCartPage() {
  const [items, setItems] = useState<QuoteCartItem[]>([]);
  const [form, setForm] = useState<QuoteForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const syncCart = () => {
      const cart = getQuoteCart();
      setItems(cart.items);
    };

    setIsMounted(true);
    syncCart();
    window.addEventListener(QUOTE_CART_EVENT, syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(QUOTE_CART_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const totalQty = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const handleQtyChange = (productId: number, nextQty: number) => {
    updateItemQuantity(productId, nextQty);
    setItems(getQuoteCart().items);
  };

  const handleRemove = (productId: number) => {
    removeItemFromQuoteCart(productId);
    setItems(getQuoteCart().items);
    toast.success("Đã xóa sản phẩm khỏi giỏ báo giá");
  };

  const handleInput = (field: keyof QuoteForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (items.length === 0) {
      toast.error("Giỏ báo giá đang trống");
      return;
    }

    if (!form.customerName.trim() || !form.phone.trim()) {
      toast.error("Vui lòng nhập đầy đủ họ tên và số điện thoại");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bao-gia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          company: form.company.trim() || null,
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          note: form.note.trim() || null,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await response.json()) as { error?: string; id?: number };
      if (!response.ok) {
        toast.error(data.error || "Không thể gửi yêu cầu báo giá");
        return;
      }

      clearQuoteCart();
      setItems([]);
      setForm(initialForm);
      toast.success(`Đã gửi yêu cầu báo giá #${data.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối. Vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null; // Avoid hydration mismatch flash
  
  return (
    <div className="bg-slate-50 min-h-screen py-8 print:bg-white print:py-4">
      {/* Print CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { font-size: 12px; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Giỏ Yêu Cầu Báo Giá</h1>
            <p className="text-slate-500 mt-1">Hiện có {totalQty} sản phẩm trong giỏ.</p>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              className="no-print border-slate-300 text-slate-600"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 mr-2" />
              In / Xuất PDF
            </Button>
          )}
        </div>

        {/* Print header — chỉ hiện khi in */}
        <div className="print-only mb-6 border-b pb-4">
          <h2 className="text-xl font-bold">Cơ Khí Khải Hào</h2>
          <p className="text-sm text-gray-500">Hotline: 090 123 4567 | Email: admin@ckkh.vn</p>
          <p className="text-sm text-gray-500">Ngày: {new Date().toLocaleDateString("vi-VN")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Danh sách sản phẩm</h2>
              {items.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    clearQuoteCart();
                    setItems([]);
                  }}
                >
                  Xóa toàn bộ
                </Button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="p-10 text-center">
                <ShoppingBag className="w-14 h-14 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Giỏ báo giá của bạn đang trống</p>
                <p className="text-sm text-slate-500 mt-1 mb-6">Hãy thêm sản phẩm từ trang chi tiết để gửi yêu cầu.</p>
                <Link href="/san-pham">
                  <Button className="bg-blue-600 hover:bg-blue-700">Xem sản phẩm</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.productId} className="p-4 flex gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden relative flex-shrink-0">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-1" />
                      ) : null}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link href={`/san-pham/chi-tiet/${item.slug}`} className="font-semibold text-slate-800 hover:text-blue-600 line-clamp-2">
                        {item.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-1">SKU: {item.sku}</p>
                      <p className="text-sm font-medium text-blue-700 mt-1">
                        {item.priceOnRequest ? "Liên hệ báo giá" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(item.price || 0))}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={() => handleQtyChange(item.productId, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(item.productId, Number(e.target.value || 1))}
                          className="w-16 h-9 text-center p-1"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove(item.productId)} className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 h-8">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 h-fit sticky top-24">
            <h2 className="font-semibold text-slate-800 mb-4">Thông tin liên hệ</h2>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input
                placeholder="Họ tên *"
                value={form.customerName}
                onChange={(e) => handleInput("customerName", e.target.value)}
              />
              <Input
                placeholder="Công ty"
                value={form.company}
                onChange={(e) => handleInput("company", e.target.value)}
              />
              <Input
                placeholder="Số điện thoại *"
                value={form.phone}
                onChange={(e) => handleInput("phone", e.target.value)}
              />
              <Input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => handleInput("email", e.target.value)}
              />
              <Textarea
                placeholder="Ghi chú thêm"
                value={form.note}
                onChange={(e) => handleInput("note", e.target.value)}
                className="min-h-[100px]"
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang gửi...
                  </>
                ) : (
                  "Gửi yêu cầu báo giá"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
