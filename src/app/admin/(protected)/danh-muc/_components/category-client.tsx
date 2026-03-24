"use client";

import { useState } from "react";
import { Category } from "@prisma/client";
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
import { deleteCategory } from "../actions";
import CategoryDialog from "./category-dialog";

// Define strict type for relations returned from the server component
type CategoryWithRelations = Category & {
  parent: Category | null;
  children: Category[];
  _count: { products: number; children: number };
};

interface CategoryClientProps {
  initialCategories: CategoryWithRelations[];
}

export default function CategoryClientRenderer({ initialCategories }: CategoryClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithRelations | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithRelations | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (categories !== initialCategories) {
    setCategories(initialCategories);
  }

  const handleEdit = (category: CategoryWithRelations) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    const result = await deleteCategory(categoryToDelete.id);
    setIsDeleting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Đã xóa danh mục thành công!");
    }
    setIsDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  // Group or sort items so children appear below parents.
  // A simple way is to separate roots and mapping their children.
  const rootCategories = categories.filter((c) => c.parentId === null);
  const sortedCategories: CategoryWithRelations[] = [];

  rootCategories.forEach((root) => {
    sortedCategories.push(root);
    const children = categories.filter((c) => c.parentId === root.id);
    sortedCategories.push(...children);
  });

  // Any orphans (though unlikely with proper structure)
  categories.forEach((c) => {
    if (!sortedCategories.includes(c)) {
      sortedCategories.push(c);
    }
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800">Tất cả danh mục ({categories.length})</h2>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Tên danh mục</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Danh mục cha</TableHead>
            <TableHead className="text-right">Sản phẩm</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCategories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                Chưa có danh mục nào.
              </TableCell>
            </TableRow>
          ) : (
            sortedCategories.map((cat) => {
              const hasParent = cat.parentId !== null;
              return (
                <TableRow key={cat.id} className={hasParent ? "bg-slate-50/50" : ""}>
                  <TableCell className="font-medium text-slate-800">
                    {hasParent ? (
                      <div className="flex items-center pl-4 text-slate-600">
                        <span className="text-slate-300 mr-2">└─</span> {cat.name}
                      </div>
                    ) : (
                      cat.name
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500 max-w-[200px] truncate">
                    {cat.description || "—"}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {cat.parent ? cat.parent.name : "—"}
                  </TableCell>
                  <TableCell className="text-right text-slate-500">
                    {cat._count.products}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-slate-100">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(cat)} className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Cập nhật
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setCategoryToDelete(cat);
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
              );
            })
          )}
        </TableBody>
      </Table>

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={selectedCategory}
        allCategories={categories}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xóa danh mục <strong>{categoryToDelete?.name}</strong>. Cẩn thận: danh mục này có chứa sản phẩm hoặc danh mục con không?
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
              {isDeleting ? "Đang xóa..." : "Xóa danh mục"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
