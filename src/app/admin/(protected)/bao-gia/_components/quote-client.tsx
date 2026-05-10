"use client";

import { useState } from "react";
import { QuoteRequest, QuoteRequestItem, Product } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateQuoteStatus } from "../actions";

type QuoteFull = QuoteRequest & {
  items: (Omit<QuoteRequestItem, "unitPrice"> & {
    unitPrice: number | null;
    product: Pick<Product, "id" | "name" | "sku">;
  })[];
};

const statusLabel: Record<string, string> = {
  new: "Mới",
  processing: "Đang xử lý",
  replied: "Đã phản hồi",
};

const statusBadge: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  replied: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface QuoteClientProps {
  initialQuotes: QuoteFull[];
}

export default function QuoteClientRenderer({ initialQuotes }: QuoteClientProps) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  if (quotes !== initialQuotes) {
    setQuotes(initialQuotes);
  }

  const handleUpdateStatus = async (id: number, status: "new" | "processing" | "replied") => {
    setLoadingId(id);
    const result = await updateQuoteStatus({ id, status });
    setLoadingId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Cập nhật trạng thái thành công");
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
  };

  return (
    <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-primary">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Danh sách yêu cầu báo giá ({quotes.length})</h2>
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[90px]">Mã</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead className="w-[120px]">Số dòng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                Chưa có yêu cầu báo giá nào.
              </TableCell>
            </TableRow>
          ) : (
            quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell className="font-mono text-xs">#{quote.id}</TableCell>
                <TableCell>
                  <p className="font-semibold text-slate-800">{quote.customerName}</p>
                  {quote.company ? <p className="text-xs text-slate-500">{quote.company}</p> : null}
                  {quote.email ? <p className="text-xs text-slate-500">{quote.email}</p> : null}
                </TableCell>
                <TableCell>{quote.phone}</TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{quote.items.length} sản phẩm</p>
                  <div className="text-xs text-slate-500 mt-1 max-w-[220px] truncate" title={quote.items.map((i) => `${i.product.sku} x${i.quantity}${i.unitPrice ? ` (${new Intl.NumberFormat("vi-VN").format(i.unitPrice)}đ)` : ""}`).join(", ")}>
                    {quote.items.map((i) => `${i.product.sku} x${i.quantity}${i.unitPrice ? ` (${new Intl.NumberFormat("vi-VN").format(i.unitPrice)}đ)` : ""}`).join(", ")}
                  </div>
                  {(() => {
                    const total = quote.items.reduce((sum, i) => sum + (i.unitPrice || 0) * i.quantity, 0);
                    return total > 0 ? (
                      <div className="text-xs font-semibold text-blue-600 mt-1" title="Tổng tạm tính">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)}
                      </div>
                    ) : null;
                  })()}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-medium ${statusBadge[quote.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {statusLabel[quote.status] || quote.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-slate-100 disabled:opacity-50"
                      disabled={loadingId === quote.id}
                    >
                      {loadingId === quote.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, "new")}>Đánh dấu Mới</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, "processing")}>Đánh dấu Đang xử lý</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, "replied")}>Đánh dấu Đã phản hồi</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
