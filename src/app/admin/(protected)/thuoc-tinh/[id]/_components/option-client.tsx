"use client";

import { useState } from "react";
import { AttributeOption } from "@prisma/client";
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
import { deleteOption } from "../actions";
import OptionDialog from "./option-dialog";

interface OptionClientProps {
  attributeId: number;
  initialOptions: AttributeOption[];
}

export default function OptionClientRenderer({ attributeId, initialOptions }: OptionClientProps) {
  const [options, setOptions] = useState(initialOptions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<AttributeOption | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<AttributeOption | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (options !== initialOptions) {
    setOptions(initialOptions);
  }

  const handleEdit = (option: AttributeOption) => {
    setSelectedOption(option);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedOption(null);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!optionToDelete) return;
    setIsDeleting(true);
    const result = await deleteOption(optionToDelete.id, attributeId);
    setIsDeleting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Đã xóa tuỳ chọn thành công!");
    }
    setIsDeleteDialogOpen(false);
    setOptionToDelete(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-4">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="font-semibold text-slate-800">Danh sách tuỳ chọn ({options.length})</h2>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Thêm tuỳ chọn mới
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[100px]">Thứ tự</TableHead>
            <TableHead>Giá trị hiển thị</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {options.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                Chưa có tuỳ chọn nào cho thuộc tính này.
              </TableCell>
            </TableRow>
          ) : (
            options.map((option) => (
              <TableRow key={option.id}>
                <TableCell className="font-medium text-slate-500">{option.sortOrder}</TableCell>
                <TableCell className="font-semibold text-slate-800">{option.value}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-slate-100">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(option)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Cập nhật
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setOptionToDelete(option);
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

      <OptionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        option={selectedOption}
        attributeId={attributeId}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xóa vĩnh viễn tuỳ chọn <strong>{optionToDelete?.value}</strong>.
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
              {isDeleting ? "Đang xóa..." : "Xóa tuỳ chọn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
