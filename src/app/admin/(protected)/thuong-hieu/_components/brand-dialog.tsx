"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Brand } from "@prisma/client";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createBrand, updateBrand } from "../actions";

const formSchema = z.object({
  name: z.string().min(1, "Tên thương hiệu không được để trống"),
  slug: z.string().min(1, "Slug không được để trống").regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ cái viết thường, số và dấu gạch ngang"),
  sortOrder: z.number().min(0, "Thứ tự phải lớn hơn hoặc bằng 0"),
});

interface BrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
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

export default function BrandDialog({ open, onOpenChange, brand }: BrandDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!brand;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      sortOrder: 0,
    },
  });

  // Reset form when dialog opens/closes or brand changes
  useEffect(() => {
    if (open) {
      if (brand) {
        form.reset({
          name: brand.name,
          slug: brand.slug,
          sortOrder: brand.sortOrder,
        });
      } else {
        form.reset({
          name: "",
          slug: "",
          sortOrder: 0,
        });
      }
    }
  }, [open, brand, form]);

  // Auto-generate slug when name changes (only if creating fresh)
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

    if (isEditing) {
      result = await updateBrand({ ...values, id: brand.id });
    } else {
      result = await createBrand(values);
    }

    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isEditing ? "Cập nhật thành công!" : "Thêm mới thành công!");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}</DialogTitle>
          <DialogDescription>
            Điền thông tin bên dưới để {isEditing ? "cập nhật" : "tạo"} thương hiệu. Lưu ý slug phải là duy nhất.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thương hiệu</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: SKF, NSK..." {...field} />
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
                    <Input placeholder="vd: skf" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tự động tạo từ tên hoặc có thể nhập tay.
                  </FormDescription>
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
                  <FormDescription>Số càng nhỏ hiển thị càng trước.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                {isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Lưu thương hiệu"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
