"use client";

import { useState } from "react";
import { SiteContent } from "@prisma/client";
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
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import { deleteSiteContent } from "../actions";
import { toast } from "sonner";
import ContentDialog from "./content-dialog";

interface ContentClientProps {
  initialContents: SiteContent[];
}

export default function ContentClientRenderer({ initialContents }: ContentClientProps) {
  const [contents, setContents] = useState(initialContents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<SiteContent | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<SiteContent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (contents !== initialContents) {
    setContents(initialContents);
  }

  const handleDelete = async () => {
    if (!contentToDelete) return;
    setIsDeleting(true);
    const result = await deleteSiteContent(contentToDelete.id);
    setIsDeleting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Đã xóa nội dung");
    setIsDeleteOpen(false);
    setContentToDelete(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800">Nội dung CMS ({contents.length})</h2>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setSelectedContent(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm nội dung
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Label</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Nội dung</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                Chưa có dữ liệu nội dung.
              </TableCell>
            </TableRow>
          ) : (
            contents.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-slate-800">{item.label || "—"}</TableCell>
                <TableCell className="font-mono text-xs">{item.key}</TableCell>
                <TableCell>
                  <span className="inline-flex px-2 py-1 rounded-full text-xs border bg-slate-100 text-slate-700 border-slate-200">
                    {item.type}
                  </span>
                </TableCell>
                <TableCell className="max-w-[360px] truncate text-slate-600" title={item.value}>
                  {item.value}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-slate-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedContent(item);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Cập nhật
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setContentToDelete(item);
                          setIsDeleteOpen(true);
                        }}
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

      <ContentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        content={selectedContent}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nội dung này?</AlertDialogTitle>
            <AlertDialogDescription>
              Nội dung với key <strong>{contentToDelete?.key}</strong> sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {isDeleting ? "Đang xóa..." : "Xóa nội dung"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
