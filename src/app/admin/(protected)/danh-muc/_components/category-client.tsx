"use client";

import { useState } from "react";
import { Category } from "@prisma/client";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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

  // Track which root categories are expanded (default: all collapsed)
  const rootCategories = categories.filter((c) => c.parentId === null);
  const [expandedRoots, setExpandedRoots] = useState<Set<number>>(
    () => new Set(rootCategories.map((c) => c.id))
  );

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

  const toggleRoot = (id: number) => {
    setExpandedRoots((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => setExpandedRoots(new Set(rootCategories.map((c) => c.id)));
  const collapseAll = () => setExpandedRoots(new Set());

  // Only count leaf products (avoid double-counting)
  const totalProducts = categories.reduce((sum, c) => sum + c._count.products, 0);

  // Compute total product count for a root: direct + all children
  const getRootTotal = (rootId: number) => {
    const direct = categories.find((c) => c.id === rootId)?._count.products ?? 0;
    const childSum = categories
      .filter((c) => c.parentId === rootId)
      .reduce((s, c) => s + c._count.products, 0);
    return direct + childSum;
  };

  return (
    <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-primary">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-800">
            Tất cả danh mục&nbsp;
            <span className="text-slate-400 font-normal text-sm">
              ({rootCategories.length} danh mục gốc, {categories.filter((c) => c.parentId).length} danh mục con)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng {totalProducts.toLocaleString("vi-VN")} sản phẩm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 h-8 text-xs"
            onClick={expandAll}
          >
            Mở tất cả
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 h-8 text-xs"
            onClick={collapseAll}
          >
            Thu tất cả
          </Button>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Tên danh mục</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead className="text-right w-28">Sản phẩm</TableHead>
            <TableHead className="text-right w-20">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rootCategories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                Chưa có danh mục nào.
              </TableCell>
            </TableRow>
          ) : (
            rootCategories.map((root) => {
              const children = categories.filter((c) => c.parentId === root.id);
              const isExpanded = expandedRoots.has(root.id);
              const hasChildren = children.length > 0;

              return [
                // Root row
                <TableRow
                  key={`root-${root.id}`}
                  className="bg-white hover:bg-slate-50/80 cursor-pointer group"
                  onClick={() => hasChildren && toggleRoot(root.id)}
                >
                  <TableCell className="pr-0 w-8">
                    {hasChildren ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </span>
                    ) : (
                      <span className="w-5 h-5 inline-block" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-800">{root.name}</span>
                      {hasChildren && (
                        <Badge
                          variant="outline"
                          className="text-xs border-slate-200 text-slate-500 font-normal ml-1"
                        >
                          {children.length} con
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm max-w-[240px] truncate">
                    {root.description || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-right">
                      <span className="text-sm text-slate-700 font-semibold">{getRootTotal(root.id)}</span>
                      {children.length > 0 && root._count.products > 0 && (
                        <span className="block text-xs text-slate-400">{root._count.products} trực tiếp</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-slate-100">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(root)} className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Cập nhật
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setCategoryToDelete(root);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>,

                // Child rows (only renders when expanded)
                ...(isExpanded
                  ? children.map((child) => (
                      <TableRow
                        key={`child-${child.id}`}
                        className="bg-slate-50/60 hover:bg-slate-100/60 border-l-2 border-transparent"
                      >
                        <TableCell className="pr-0 w-8">
                          <span className="w-5 h-5 inline-block" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 pl-5">
                            <span className="text-slate-300 text-xs font-mono">└─</span>
                            <span className="text-slate-600 text-sm">{child.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm max-w-[240px] truncate">
                          {child.description || "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-500">
                          {child._count.products}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-slate-100">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEdit(child)}
                                className="cursor-pointer"
                              >
                                <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Cập nhật
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setCategoryToDelete(child);
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
                  : []),
              ];
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
              Thao tác này sẽ xóa danh mục{" "}
              <strong>{categoryToDelete?.name}</strong>.
              {categoryToDelete?._count.children ? (
                <span className="block mt-2 text-amber-600 font-medium">
                  Cảnh báo: Danh mục này có {categoryToDelete._count.children} danh mục con!
                </span>
              ) : ""}
              {categoryToDelete?._count.products ? (
                <span className="block mt-1 text-red-600 font-medium">
                  Cảnh báo: Có {categoryToDelete._count.products} sản phẩm trong danh mục này!
                </span>
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
              {isDeleting ? "Đang xóa..." : "Xóa danh mục"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
