"use client";

import { useState } from "react";
import { Brand } from "@prisma/client";
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
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
import { deleteBrand } from "../actions";
import BrandDialog from "./brand-dialog";

interface BrandClientProps {
  initialBrands: Brand[];
}

export default function BrandClientRenderer({ initialBrands }: BrandClientProps) {
  const [brands, setBrands] = useState(initialBrands);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state if initialBrands change from server (e.g. after revalidatePath)
  // Normally unhandled in trivial apps, but better for Next.js 14 server components
  if (brands !== initialBrands) {
    setBrands(initialBrands);
  }

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedBrand(null);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return;
    setIsDeleting(true);
    const result = await deleteBrand(brandToDelete.id);
    setIsDeleting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Đã xóa thương hiệu thành công!");
    }
    setIsDeleteDialogOpen(false);
    setBrandToDelete(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800">Tất cả thương hiệu ({brands.length})</h2>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Thêm thương hiệu
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[80px]">Thứ tự</TableHead>
            <TableHead>Tên thương hiệu</TableHead>
            <TableHead>Slug (Đường dẫn)</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                Chưa có thương hiệu nào.
              </TableCell>
            </TableRow>
          ) : (
            brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium text-slate-600">{brand.sortOrder}</TableCell>
                <TableCell className="font-semibold text-slate-800">{brand.name}</TableCell>
                <TableCell className="text-slate-500">{brand.slug}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-slate-100">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(brand)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Cập nhật
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setBrandToDelete(brand);
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

      <BrandDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        brand={selectedBrand}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xóa thương hiệu <strong>{brandToDelete?.name}</strong>. Dữ liệu không thể khôi phục.
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
              {isDeleting ? "Đang xóa..." : "Xóa thương hiệu"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
