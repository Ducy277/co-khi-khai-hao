"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Plus, Pencil, Trash2, MoreHorizontal, Image as ImageIcon,
  Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X,
  Star, Eye, EyeOff, Check, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteProduct, quickUpdateProduct } from "../actions";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

type ProductRow = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number | null;
  priceOnRequest: boolean;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: number;
  brandId: number | null;
  createdAt: string;
  updatedAt: string;
  category: { id: number; name: string; slug: string } | null;
  brand: { id: number; name: string } | null;
  _count: { quoteItems: number };
  coverImage: string;
};

type CategoryOption = {
  id: number;
  name: string;
  parentId: number | null;
};

interface ProductClientProps {
  initialProducts: ProductRow[];
  categories: CategoryOption[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  categoryId?: number;
}

// ─── Inline price editor ─────────────────────────────────────────────────────
function PriceCell({ product, onUpdated }: { product: ProductRow; onUpdated: (id: number, price: number | null, priceOnRequest: boolean) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(product.price?.toString() ?? "");
  const [onRequest, setOnRequest] = useState(product.priceOnRequest);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return "—";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const handleOpen = () => {
    setValue(product.price?.toString() ?? "");
    setOnRequest(product.priceOnRequest);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSave = async () => {
    setLoading(true);
    const newPrice = onRequest ? null : (value.trim() ? Number(value) : null);
    const result = await quickUpdateProduct(product.id, { price: newPrice, priceOnRequest: onRequest });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Đã cập nhật giá!");
      onUpdated(product.id, newPrice, onRequest);
      setEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={handleOpen}
        className="group flex items-center justify-end gap-1.5 w-full text-right hover:text-blue-600 transition-colors"
        title="Click để sửa giá"
      >
        <span className="font-medium text-sm">
          {product.priceOnRequest
            ? <span className="text-amber-600">Liên hệ</span>
            : formatPrice(product.price)
          }
        </span>
        <DollarSign className="w-3 h-3 text-slate-300 group-hover:text-blue-400 transition-colors" />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 items-end min-w-[160px]">
      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={onRequest}
          onChange={(e) => setOnRequest(e.target.checked)}
          className="w-3.5 h-3.5"
        />
        Liên hệ báo giá
      </label>
      {!onRequest && (
        <Input
          ref={inputRef}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="VD: 500000"
          className="h-8 text-sm w-36 text-right"
        />
      )}
      <div className="flex gap-1">
        <Button size="sm" className="h-7 px-2 text-xs" onClick={handleSave} disabled={loading}>
          <Check className="w-3 h-3 mr-1" /> Lưu
        </Button>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setEditing(false)}>
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

// ─── Toggle badge ─────────────────────────────────────────────────────────────
function ToggleBadge({
  active, activeLabel, inactiveLabel, activeClass, inactiveClass, onClick, loading,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  activeClass: string;
  inactiveClass: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border-none transition-all cursor-pointer select-none
        ${active ? activeClass : inactiveClass}
        ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-80 active:scale-95"}`}
      title={`Click để ${active ? "tắt" : "bật"}`}
    >
      {loading ? "..." : active ? activeLabel : inactiveLabel}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductClientRenderer({
  initialProducts, categories, total, page, totalPages, search, categoryId,
}: ProductClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState(initialProducts);
  const [searchInput, setSearchInput] = useState(search);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Sync when server re-renders
  if (products !== initialProducts) {
    setProducts(initialProducts);
  }

  const updateUrl = useCallback(
    (updates: { page?: number; search?: string; category?: string }) => {
      const params = new URLSearchParams();
      const newSearch = "search" in updates ? updates.search : search;
      const newPage = "page" in updates ? updates.page : page;
      const newCategory = "category" in updates ? updates.category : (categoryId?.toString() || "");
      if (newSearch) params.set("search", newSearch);
      if (newPage && newPage > 1) params.set("page", String(newPage));
      if (newCategory && newCategory !== "all") params.set("category", newCategory);
      startTransition(() => { router.push(`${pathname}?${params.toString()}`); });
    },
    [pathname, router, search, page, categoryId]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchInput, page: 1 });
  };

  const handleCategoryChange = (value: string | null) => {
    if (!value) return;
    updateUrl({ category: value === "all" ? "" : value, page: 1 });
  };

  const handlePageChange = (newPage: number) => updateUrl({ page: newPage });

  // Optimistic toggle for isActive / isFeatured
  const handleToggle = async (product: ProductRow, field: "isActive" | "isFeatured") => {
    const newVal = !product[field];
    setTogglingId(product.id);
    // Optimistic update
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, [field]: newVal } : p));
    const result = await quickUpdateProduct(product.id, { [field]: newVal });
    setTogglingId(null);
    if (result.error) {
      toast.error(result.error);
      // Rollback
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, [field]: !newVal } : p));
    } else {
      toast.success(field === "isActive"
        ? (newVal ? "Đã hiện sản phẩm" : "Đã ẩn sản phẩm")
        : (newVal ? "Đã bật nổi bật" : "Đã tắt nổi bật")
      );
    }
  };

  const handlePriceUpdated = (id: number, price: number | null, priceOnRequest: boolean) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, price, priceOnRequest } : p));
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const result = await deleteProduct(productToDelete.id);
    setIsDeleting(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Đã xóa sản phẩm thành công!");
      router.refresh();
    }
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  // Build grouped category list: root → children inline
  const rootCats = categories.filter((c) => !c.parentId);
  const groupedCategories: CategoryOption[] = [];
  rootCats.forEach((root) => {
    groupedCategories.push(root);
    categories.filter((c) => c.parentId === root.id).forEach((child) => groupedCategories.push(child));
  });
  // Append any orphans (parentId set but parent not in list)
  categories.forEach((c) => {
    if (!groupedCategories.includes(c)) groupedCategories.push(c);
  });

  return (
    <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-primary">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">
              Tất cả sản phẩm&nbsp;
              <span className="text-slate-400 font-normal text-sm">({total.toLocaleString("vi-VN")} sản phẩm)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Trang {page}/{totalPages} — Hiển thị {products.length} sản phẩm
            </p>
          </div>
          <Link href="/admin/san-pham/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm theo tên, SKU..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8 h-9 text-sm bg-white"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(""); updateUrl({ search: "", page: 1 }); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <Button type="submit" size="sm" variant="secondary" className="h-9 px-4 shrink-0">
              Tìm
            </Button>
          </form>

          <Select value={categoryId?.toString() || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-9 text-sm w-full sm:w-56 bg-white">
              <SelectValue placeholder="Tất cả danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {groupedCategories.map((cat) => {
                const isChild = !!cat.parentId;
                return (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {isChild ? `   └─ ${cat.name}` : cat.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className={isPending ? "opacity-60 pointer-events-none transition-opacity" : ""}>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[66px]">Ảnh</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-center w-24">Nổi bật</TableHead>
                <TableHead className="text-right w-44">Giá bán</TableHead>
                <TableHead className="text-center w-24">Hiển thị</TableHead>
                <TableHead className="text-right w-16">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                    {search || categoryId ? (
                      <div>
                        <p className="font-medium">Không tìm thấy sản phẩm nào</p>
                        <p className="text-sm mt-1">Thử điều chỉnh bộ lọc tìm kiếm</p>
                      </div>
                    ) : "Chưa có sản phẩm nào."}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.coverImage ? (
                        <div className="w-11 h-11 rounded-lg border border-slate-200 overflow-hidden relative bg-slate-50">
                          <Image src={product.coverImage} alt={product.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <p className="font-semibold text-slate-800 line-clamp-2 text-sm" title={product.name}>
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">SKU: {product.sku}</p>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-normal border-slate-300 text-slate-600 text-xs">
                        {product.category?.name || "—"}
                      </Badge>
                    </TableCell>

                    {/* Nổi bật — clickable toggle */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleToggle(product, "isFeatured")}
                        disabled={togglingId === product.id}
                        title={product.isFeatured ? "Đang nổi bật — click để tắt" : "Chưa nổi bật — click để bật"}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all
                          ${product.isFeatured
                            ? "bg-amber-100 text-amber-500 hover:bg-amber-200"
                            : "bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-400"}
                          ${togglingId === product.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-90"}`}
                      >
                        <Star className={`w-4 h-4 ${product.isFeatured ? "fill-amber-400" : ""}`} />
                      </button>
                    </TableCell>

                    {/* Giá — inline editable */}
                    <TableCell className="text-right">
                      <PriceCell product={product} onUpdated={handlePriceUpdated} />
                    </TableCell>

                    {/* Hiển thị — clickable toggle */}
                    <TableCell className="text-center">
                      <ToggleBadge
                        active={product.isActive}
                        activeLabel="Hiển thị"
                        inactiveLabel="Đã ẩn"
                        activeClass="bg-green-100 text-green-700"
                        inactiveClass="bg-slate-100 text-slate-500"
                        onClick={() => handleToggle(product, "isActive")}
                        loading={togglingId === product.id}
                      />
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-slate-100">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/admin/san-pham/${product.id}/edit`}>
                            <DropdownMenuItem className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Cập nhật đầy đủ
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggle(product, "isActive")}
                            className="cursor-pointer"
                          >
                            {product.isActive
                              ? <><EyeOff className="mr-2 h-4 w-4 text-slate-500" /> Ẩn sản phẩm</>
                              : <><Eye className="mr-2 h-4 w-4 text-green-500" /> Hiện sản phẩm</>
                            }
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggle(product, "isFeatured")}
                            className="cursor-pointer"
                          >
                            <Star className="mr-2 h-4 w-4 text-amber-400" />
                            {product.isFeatured ? "Bỏ nổi bật" : "Đặt nổi bật"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => { setProductToDelete(product); setIsDeleteDialogOpen(true); }}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap bg-slate-50">
            <p className="text-sm text-slate-500">
              Trang <span className="font-medium text-slate-800">{page}</span> / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(1)} disabled={page <= 1 || isPending}>
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(page - 1)} disabled={page <= 1 || isPending}>
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = page - 2 + i;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 text-sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isPending}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages || isPending}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(totalPages)} disabled={page >= totalPages || isPending}>
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Có chắc chắn muốn xóa?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này sẽ xóa vĩnh viễn sản phẩm <strong>{productToDelete?.name}</strong>.
                {productToDelete?._count.quoteItems ? (
                  <span className="block mt-2 text-red-600 font-medium">
                    Cảnh báo: Sản phẩm này đang nằm trong {productToDelete._count.quoteItems} yêu cầu báo giá!
                  </span>
                ) : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                onClick={(e) => { e.preventDefault(); handleDeleteConfirm(); }}
                disabled={isDeleting}
              >
                {isDeleting ? "Đang xóa..." : "Xóa sản phẩm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
