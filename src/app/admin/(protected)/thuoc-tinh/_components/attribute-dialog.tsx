"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Category, CategoryAttribute } from "@prisma/client";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createAttribute, updateAttribute } from "../actions";

const formSchema = z.object({
  name: z.string().min(1, "Tên thuộc tính không được trống"),
  slug: z.string().min(1, "Slug không được trống"),
  unit: z.string().optional(),
  type: z.enum(["text", "number", "select"]),
  filterType: z.enum(["checkbox", "range", "dropdown", "none"]),
  isGlobal: z.boolean(),
  categoryId: z.string().optional(),
  sortOrder: z.number().min(0),
}).superRefine((data, ctx) => {
  if (!data.isGlobal && (!data.categoryId || data.categoryId === "none")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Nếu không chọn Toàn cục, bạn phải chọn một Danh mục cụ thể.",
      path: ["categoryId"],
    });
  }
});

interface AttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute: CategoryAttribute | null;
  categories: Category[];
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

export default function AttributeDialog({ open, onOpenChange, attribute, categories }: AttributeDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!attribute;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      unit: "",
      type: "text",
      filterType: "none",
      isGlobal: false,
      categoryId: "none",
      sortOrder: 0,
    },
  });

  const watchIsGlobal = form.watch("isGlobal");
  const watchType = form.watch("type");

  useEffect(() => {
    if (open) {
      if (attribute) {
        form.reset({
          name: attribute.name,
          slug: attribute.slug,
          unit: attribute.unit || "",
          type: attribute.type as "text" | "number" | "select",
          filterType: attribute.filterType as "checkbox" | "range" | "dropdown" | "none",
          isGlobal: attribute.isGlobal,
          categoryId: attribute.categoryId ? attribute.categoryId.toString() : "none",
          sortOrder: attribute.sortOrder,
        });
      } else {
        form.reset({
          name: "",
          slug: "",
          unit: "",
          type: "text",
          filterType: "none",
          isGlobal: false,
          categoryId: "none",
          sortOrder: 0,
        });
      }
    }
  }, [open, attribute, form]);

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

    const payload = {
      ...values,
      categoryId: values.isGlobal || values.categoryId === "none" ? null : Number(values.categoryId),
      unit: values.unit || null,
      isRequired: attribute?.isRequired ?? false,
      isActive: attribute?.isActive ?? true,
    };

    if (isEditing) {
      result = await updateAttribute({ ...payload, id: attribute.id });
    } else {
      result = await createAttribute(payload);
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
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Cập nhật Thuộc tính" : "Thêm Thuộc tính mới"}</DialogTitle>
          <DialogDescription>
            Định nghĩa một thuộc tính và kiểu dữ liệu (VD: Đường kính (số), Màu sắc (chọn nhiều)...)
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Tên thuộc tính (VD: Vật liệu)</FormLabel>
                    <FormControl>
                      <Input placeholder="Vật liệu..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="vat-lieu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kiểu dữ liệu</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn kiểu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="text">Văn bản (Text)</SelectItem>
                        <SelectItem value="number">Số (Number)</SelectItem>
                        <SelectItem value="select">Lựa chọn (Select)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: mm, kg..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="filterType"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Sử dụng chung bộ lọc?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Không cấu hình lọc" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Không hiển thị ở bộ lọc</SelectItem>
                        <SelectItem value="checkbox" disabled={watchType !== "select"}>
                          Hộp kiểm nhiều (Checkbox - Cần loại Select)
                        </SelectItem>
                        <SelectItem value="dropdown" disabled={watchType !== "select"}>
                          Dropdown chọn 1 (Dropdown - Cần loại Select)
                        </SelectItem>
                        <SelectItem value="range" disabled={watchType !== "number"}>
                          Thanh trượt theo khoảng (Range - Cần dạng Số)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Cách thuộc tính này hiện ở sidebar Lọc (Giao diện Khách).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isGlobal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-2">
                    <div className="space-y-0.5">
                      <FormLabel>Áp dụng Toàn cục</FormLabel>
                      <FormDescription>
                        Bật nếu thuộc tính này có mặt ở mọi Danh mục (VD: Thương hiệu, Cân nặng).
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!watchIsGlobal && (
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Danh mục áp dụng</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">-- Vui lòng chọn --</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.parentId ? `└─ ${c.name}` : c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Thứ tự ưu tiên</FormLabel>
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

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                {isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Lưu thuộc tính"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
