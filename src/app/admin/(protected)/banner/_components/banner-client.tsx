"use client";

import { useState } from "react";
import { Banner } from "@prisma/client";
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
import { deleteBanner } from "../actions";
import { toast } from "sonner";
import BannerDialog from "./banner-dialog";

interface BannerClientProps {
  initialBanners: Banner[];
}

export default function BannerClientRenderer({ initialBanners }: BannerClientProps) {
  const [banners, setBanners] = useState(initialBanners);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (banners !== initialBanners) {
    setBanners(initialBanners);
  }

  const handleDelete = async () => {
    if (!bannerToDelete) return;
    setIsDeleting(true);
    const result = await deleteBanner(bannerToDelete.id);
    setIsDeleting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Đã xóa banner");
    setIsDeleteOpen(false);
    setBannerToDelete(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800">Danh sách banner ({banners.length})</h2>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setSelectedBanner(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm banner
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[80px]">Thứ tự</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                Chưa có banner nào.
              </TableCell>
            </TableRow>
          ) : (
            banners.map((banner) => (
              <TableRow key={banner.id}>
                <TableCell>{banner.sortOrder}</TableCell>
                <TableCell>
                  <p className="font-semibold text-slate-800">{banner.title}</p>
                  {banner.subtitle ? <p className="text-xs text-slate-500 line-clamp-2">{banner.subtitle}</p> : null}
                </TableCell>
                <TableCell className="text-slate-600">{banner.link || "—"}</TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs border ${banner.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    {banner.isActive ? "Đang bật" : "Đang tắt"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-slate-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedBanner(banner);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Cập nhật
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setBannerToDelete(banner);
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

      <BannerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        banner={selectedBanner}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa banner này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Banner <strong>{bannerToDelete?.title}</strong> sẽ bị xóa.
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
              {isDeleting ? "Đang xóa..." : "Xóa banner"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
