"use client";

import { useEffect, useState } from "react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createCategory, updateCategory } from "../actions";

const formSchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống"),
  slug: z.string().min(1, "Slug không được để trống").regex(/^[a-z0-9-]+$/, "Slug hợp lệ (chữ thường, số, gạch ngang)"),
  description: z.string().optional(),
  parentId: z.string().optional(), // Lấy dạng string từ select, sẽ convert sang number khi submit
  sortOrder: z.number().min(0),
});

type CategoryFormItem = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  sortOrder: number;
};

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryFormItem | null;
  allCategories: CategoryFormItem[];
}

function generateSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoryDialog({ open, onOpenChange, category, allCategories }: CategoryDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!category;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: "none",
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (category) {
        form.reset({
          name: category.name,
          slug: category.slug,
          description: category.description || "",
          parentId: category.parentId ? category.parentId.toString() : "none",
          sortOrder: category.sortOrder,
        });
      } else {
        form.reset({
          name: "",
          slug: "",
          description: "",
          parentId: "none",
          sortOrder: 0,
        });
      }
    }
  }, [open, category, form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name" && !isEditing) {
        form.setValue("slug", generateSlug(value.name || ""), {
          shouldValidate: true,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isEditing]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsPending(true);
    let result;

    const parsedValues = {
      ...values,
      parentId: values.parentId === "none" ? null : Number(values.parentId),
    };

    if (isEditing) {
      result = await updateCategory({ ...parsedValues, id: category.id });
    } else {
      result = await createCategory(parsedValues);
    }

    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isEditing ? "Cập nhật thành công!" : "Thêm mới thành công!");
      onOpenChange(false);
    }
  };

  // Loại bỏ category hiện tại khỏi danh sách có thể chọn làm cha
  const availableParents = allCategories.filter((c) => c.id !== category?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Cập nhật danh mục" : "Thêm danh mục mới"}</DialogTitle>
          <DialogDescription>
            Điền thông tin bên dưới để {isEditing ? "cập nhật" : "tạo mới"} danh mục.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Ổ bi, Bánh răng..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (Đường dẫn tĩnh)</FormLabel>
                  <FormControl>
                    <Input placeholder="vd: o-bi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục cha</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục cha" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">-- Không có (Danh mục gốc) --</SelectItem>
                      {availableParents.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id.toString()}>
                          {parent.parentId ? `└─ ${parent.name}` : parent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Nằm trong danh mục nào. Quản trị chỉ nên dùng tới cấp 2.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả ngắn</FormLabel>
                  <FormControl>
                    <Input placeholder="Tùy chọn mô tả ngắn" {...field} />
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

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                {isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Lưu danh mục"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
