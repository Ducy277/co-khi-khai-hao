"use client";

import { useState } from "react";
import { Category, CategoryAttribute } from "@prisma/client";
import { Plus, Pencil, Trash2, MoreHorizontal, ListPlus } from "lucide-react";
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
import { deleteAttribute } from "../actions";
import AttributeDialog from "./attribute-dialog";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type AttributeWithRelations = CategoryAttribute & {
  category: Category | null;
  _count: { options: number };
};

interface AttributeClientProps {
  initialAttributes: AttributeWithRelations[];
  categories: Category[];
}

export default function AttributeClientRenderer({ initialAttributes, categories }: AttributeClientProps) {
  const [attributes, setAttributes] = useState(initialAttributes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeWithRelations | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<AttributeWithRelations | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (attributes !== initialAttributes) {
    setAttributes(initialAttributes);
  }

  const handleEdit = (attribute: AttributeWithRelations) => {
    setSelectedAttribute(attribute);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedAttribute(null);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!attributeToDelete) return;
    setIsDeleting(true);
    const result = await deleteAttribute(attributeToDelete.id);
    setIsDeleting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Đã xóa thuộc tính thành công!");
    }
    setIsDeleteDialogOpen(false);
    setAttributeToDelete(null);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "text": return "Văn bản";
      case "number": return "Số (Number)";
      case "select": return "Lựa chọn (Select)";
      default: return type;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800">Tất cả thuộc tính ({attributes.length})</h2>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Thêm thuộc tính
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Tên thuộc tính</TableHead>
            <TableHead>Kiểu dữ liệu</TableHead>
            <TableHead>Phạm vi</TableHead>
            <TableHead className="text-center">Số tuỳ chọn</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attributes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                Chưa có thuộc tính động nào được tạo.
              </TableCell>
            </TableRow>
          ) : (
            attributes.map((attr) => (
              <TableRow key={attr.id}>
                <TableCell>
                  <p className="font-medium text-slate-800">{attr.name}</p>
                  <p className="text-xs text-slate-500">Slug: {attr.slug}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal border-slate-300">
                    {getTypeLabel(attr.type)}
                  </Badge>
                  {attr.unit && <span className="ml-2 text-xs text-slate-500">({attr.unit})</span>}
                </TableCell>
                <TableCell>
                  {attr.isGlobal ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200">
                      Toàn cục (Tất cả)
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      Chỉ định: {attr.category?.name}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {attr.type === "select" ? (
                    <Link href={`/admin/thuoc-tinh/${attr.id}`} className="text-blue-600 hover:underline flex items-center justify-center font-medium">
                      <ListPlus className="w-3 h-3 mr-1" />
                      {attr._count.options} options
                    </Link>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(attr)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Cập nhật
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setAttributeToDelete(attr);
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

      <AttributeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        attribute={selectedAttribute}
        categories={categories}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xóa vĩnh viễn thuộc tính <strong>{attributeToDelete?.name}</strong> cùng với các lựa chọn của nó. Các sản phẩm đang dùng thuộc tính này cũng sẽ mất dữ liệu lọc.
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
              {isDeleting ? "Đang xóa..." : "Xóa thuộc tính"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
