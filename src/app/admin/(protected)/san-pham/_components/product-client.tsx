"use client";

import { useState } from "react";
import { Product, Category, Brand } from "@prisma/client";
import { Plus, Pencil, Trash2, MoreHorizontal, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteProduct } from "../actions";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

type ProductWithRelations = Product & {
  category: Category;
  brand: Brand | null;
  coverImage: string;
  _count: { quoteItems: number };
};

interface ProductClientProps {
  initialProducts: ProductWithRelations[];
}

export default function ProductClientRenderer({ initialProducts }: ProductClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductWithRelations | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (products !== initialProducts) {
    setProducts(initialProducts);
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const result = await deleteProduct(productToDelete.id);
    setIsDeleting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Đã xóa sản phẩm thành công!");
    }
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const formatPrice = (price: unknown) => {
    if (!price) return "—";
    const num = Number(price);
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  return (
    <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-primary">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800">Tất cả sản phẩm ({products.length})</h2>
        <Link href="/admin/san-pham/create">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
          </Button>
        </Link>
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[80px]">Hình ảnh</TableHead>
            <TableHead>Tên sản phẩm</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Thương hiệu</TableHead>
            <TableHead className="text-right">Giá bán</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                Chưa có sản phẩm nào.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.coverImage ? (
                    <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden relative bg-slate-50">
                      <Image 
                        src={product.coverImage} 
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <p className="font-semibold text-slate-800 line-clamp-2" title={product.name}>{product.name}</p>
                  <p className="text-xs text-slate-500 mt-1">SKU: {product.sku}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal border-slate-300 text-slate-600">
                    {product.category.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  {product.brand ? (
                    <span className="text-sm text-slate-700">{product.brand.name}</span>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium text-slate-800">
                  {product.priceOnRequest ? (
                    <span className="text-amber-600 text-sm">Liên hệ báo giá</span>
                  ) : (
                    formatPrice(product.price)
                  )}
                </TableCell>
                <TableCell className="text-center space-x-1 space-y-1">
                  {product.isActive ? (
                    <Badge className="bg-green-100 text-green-700 border-none hover:bg-green-200">Hiển thị</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">Đã ẩn</Badge>
                  )}
                  {product.isFeatured && (
                    <Badge className="bg-blue-100 text-blue-700 border-none hover:bg-blue-200">Nổi bật</Badge>
                  )}
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
                          <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Cập nhật
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        onClick={() => {
                          setProductToDelete(product);
                          setIsDeleteDialogOpen(true);
                        }}
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn sản phẩm <strong>{productToDelete?.name}</strong>.
              {productToDelete?._count.quoteItems ? (
                <span className="block mt-2 text-red-600 font-medium">Cảnh báo: Sản phẩm này đang nằm trong {productToDelete._count.quoteItems} yêu cầu báo giá!</span>
              ) : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
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
