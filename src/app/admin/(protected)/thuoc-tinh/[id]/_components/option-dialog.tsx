"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AttributeOption } from "@prisma/client";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createOption, updateOption } from "../actions";

const formSchema = z.object({
  value: z.string().min(1, "Giá trị tuỳ chọn không được trống"),
  sortOrder: z.coerce.number().default(0),
});

interface OptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  option: AttributeOption | null;
  attributeId: number;
}

export default function OptionDialog({ open, onOpenChange, option, attributeId }: OptionDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!option;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (option) {
        form.reset({
          value: option.value,
          sortOrder: option.sortOrder,
        });
      } else {
        form.reset({
          value: "",
          sortOrder: 0,
        });
      }
    }
  }, [open, option, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsPending(true);
    let result;

    const payload = {
      ...values,
      attributeId,
    };

    if (isEditing) {
      result = await updateOption({ ...payload, id: option.id });
    } else {
      result = await createOption(payload);
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Cập nhật tuỳ chọn" : "Thêm tuỳ chọn mới"}</DialogTitle>
          <DialogDescription>
            Nhập giá trị cho thuộc tính này (VD: Màu Đỏ, Kích cỡ L, Thép Không gỉ...)
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá trị hiển thị</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Đỏ, 10mm, Inox 304..." {...field} />
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
                    <Input type="number" {...field} />
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
                {isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Lưu tuỳ chọn"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
