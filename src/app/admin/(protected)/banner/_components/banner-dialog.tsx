"use client";

import { useEffect, useState } from "react";
import { Banner } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createBanner, updateBanner } from "../actions";
import { toast } from "sonner";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";

const formSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  subtitle: z.string().optional(),
  image: z.string().min(1, "Vui lòng nhập URL ảnh"),
  link: z.string().optional(),
  sortOrder: z.number(),
  isActive: z.boolean(),
});

interface BannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: Banner | null;
  categories: { name: string; slug: string }[];
}

export default function BannerDialog({ open, onOpenChange, banner, categories }: BannerDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!banner;

  type FormOutput = z.output<typeof formSchema>;

  const form = useForm<FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      image: "",
      link: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (banner) {
      form.reset({
        title: banner.title,
        subtitle: banner.subtitle || "",
        image: banner.image,
        link: banner.link || "",
        sortOrder: banner.sortOrder,
        isActive: banner.isActive,
      });
      return;
    }

    form.reset({
      title: "",
      subtitle: "",
      image: "",
      link: "",
      sortOrder: 0,
      isActive: true,
    });
  }, [open, banner, form]);

  const onSubmit = async (values: FormOutput) => {
    setIsPending(true);
    const result = isEditing
      ? await updateBanner({ ...values, id: banner.id, subtitle: values.subtitle || null, link: values.link || null })
      : await createBanner({ ...values, subtitle: values.subtitle || null, link: values.link || null });
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Cập nhật banner thành công" : "Thêm banner thành công");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Cập nhật banner" : "Thêm banner mới"}</DialogTitle>
          <DialogDescription>
            Quản lý nội dung hiển thị ở khu vực hero trang chủ.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Phụ tùng cơ khí chính hãng" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả ngắn</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mô tả banner" className="min-h-[90px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình ảnh Banner</FormLabel>
                  <FormControl>
                    <ImageUploadZone value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link đích</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trang đích" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectGroup>
                            <SelectLabel>Trang tĩnh</SelectLabel>
                            <SelectItem value="/">Trang chủ</SelectItem>
                            <SelectItem value="/san-pham">Tất cả sản phẩm</SelectItem>
                            <SelectItem value="/bao-gia">Báo giá</SelectItem>
                            <SelectItem value="/dich-vu">Dịch vụ</SelectItem>
                            <SelectItem value="/gioi-thieu">Giới thiệu</SelectItem>
                            <SelectItem value="/lien-he">Liên hệ</SelectItem>
                          </SelectGroup>
                          {categories && categories.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>Danh mục sản phẩm</SelectLabel>
                              {categories.map((cat) => (
                                <SelectItem key={cat.slug} value={`/san-pham/${cat.slug}`}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự hiển thị</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value || 0))}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel>Kích hoạt banner</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                {isPending ? "Đang lưu..." : isEditing ? "Cập nhật" : "Lưu banner"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
