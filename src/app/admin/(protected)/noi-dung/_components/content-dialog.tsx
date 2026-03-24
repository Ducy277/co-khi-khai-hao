"use client";

import { useEffect, useState } from "react";
import { SiteContent } from "@prisma/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createSiteContent, updateSiteContent } from "../actions";
import { toast } from "sonner";

const formSchema = z.object({
  key: z.string().min(1, "Key không được để trống"),
  value: z.string().min(1, "Nội dung không được để trống"),
  type: z.enum(["text", "html", "image"]),
  label: z.string().optional(),
});

interface ContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: SiteContent | null;
}

export default function ContentDialog({ open, onOpenChange, content }: ContentDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!content;

  type FormOutput = z.output<typeof formSchema>;

  const form = useForm<FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: "",
      value: "",
      type: "text",
      label: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (content) {
      form.reset({
        key: content.key,
        value: content.value,
        type: content.type as "text" | "html" | "image",
        label: content.label || "",
      });
      return;
    }

    form.reset({
      key: "",
      value: "",
      type: "text",
      label: "",
    });
  }, [open, content, form]);

  const onSubmit = async (values: FormOutput) => {
    setIsPending(true);
    const result = isEditing
      ? await updateSiteContent({ ...values, id: content.id, label: values.label || null })
      : await createSiteContent({ ...values, label: values.label || null });
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Cập nhật nội dung thành công" : "Thêm nội dung thành công");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Cập nhật nội dung" : "Thêm nội dung mới"}</DialogTitle>
          <DialogDescription>
            Quản lý nội dung CMS cho các trang công khai.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhãn hiển thị</FormLabel>
                  <FormControl>
                    <Input placeholder="Giới thiệu ngắn trang chủ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key</FormLabel>
                    <FormControl>
                      <Input placeholder="about_short" {...field} disabled={isEditing} />
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
                    <FormLabel>Loại nội dung</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="image">Image URL</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[180px]" placeholder="Nhập nội dung..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                {isPending ? "Đang lưu..." : isEditing ? "Cập nhật" : "Lưu nội dung"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
