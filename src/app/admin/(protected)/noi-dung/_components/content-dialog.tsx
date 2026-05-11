"use client";

import { useEffect, useRef, useState } from "react";
import { SiteContent } from "@prisma/client";
import { useForm, useWatch } from "react-hook-form";
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
import { ImageIcon, Upload, X, Loader2, Code } from "lucide-react";
import Image from "next/image";
import { sanitizeHtml } from "@/lib/sanitize";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import { MediaGalleryModal } from "@/components/ui/media-gallery-modal";
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

// ─── HTML Editor with image insert ───────────────────────────────────────────
function HtmlEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const insertAtCursor = (insertText: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      onChange(value + insertText);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const newValue = before + insertText + after;
    onChange(newValue);
    // Restore cursor after React re-render
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + insertText.length;
      ta.focus();
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn (tối đa 5MB)");
      return;
    }

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "content");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        insertAtCursor(`<img src="${data.url}" alt="" class="max-w-full rounded-lg my-2" />`);
        toast.success("Đã chèn ảnh vào nội dung!");
      } else {
        toast.error(data.error || "Tải ảnh thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối khi tải ảnh lên");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toolbarActions = [
    { label: "B", title: "In đậm", wrap: (s: string) => `<strong>${s}</strong>`, icon: null },
    { label: "I", title: "In nghiêng", wrap: (s: string) => `<em>${s}</em>`, icon: null },
    { label: "P", title: "Đoạn văn", wrap: (s: string) => `<p>${s}</p>`, icon: null },
    { label: "H2", title: "Tiêu đề 2", wrap: (s: string) => `<h2>${s}</h2>`, icon: null },
    { label: "H3", title: "Tiêu đề 3", wrap: (s: string) => `<h3>${s}</h3>`, icon: null },
    { label: "UL", title: "Danh sách", wrap: (s: string) => `<ul>\n  <li>${s}</li>\n</ul>`, icon: null },
  ];

  const handleToolbarAction = (wrap: (s: string) => string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end) || "nội dung";
    const inserted = wrap(selected);
    const before = value.slice(0, start);
    const after = value.slice(end);
    onChange(before + inserted + after);
  };

  return (
    <div className="space-y-1.5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 rounded-t-md border border-b-0 border-slate-200">
        {toolbarActions.map((action) => (
          <button
            key={action.label}
            type="button"
            title={action.title}
            onClick={() => handleToolbarAction(action.wrap)}
            className="px-2 py-1 text-xs font-mono font-semibold text-slate-600 rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
          >
            {action.label}
          </button>
        ))}

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Insert image button */}
        <button
          type="button"
          title="Chèn ảnh vào nội dung"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 rounded hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5" />
          )}
          {isUploading ? "Đang tải..." : "Chèn ảnh"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
        />

        <button
          type="button"
          title="Chọn ảnh từ thư viện"
          onClick={() => setIsGalleryOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 rounded hover:bg-slate-200 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          Thư viện
        </button>

        <MediaGalleryModal
          open={isGalleryOpen}
          onOpenChange={setIsGalleryOpen}
          onSelect={(url) => {
            insertAtCursor(`<img src="${url}" alt="" class="max-w-full rounded-lg my-2" />`);
          }}
        />

        <div className="ml-auto flex items-center gap-1 text-xs text-slate-400">
          <Code className="w-3.5 h-3.5" />
          HTML
        </div>
      </div>

      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="<p>Nhập nội dung HTML...</p>"
        className="min-h-[240px] font-mono text-xs rounded-t-none border-t-0 resize-y"
      />

      {/* Preview toggle */}
      {value && (
        <details className="text-xs">
          <summary className="cursor-pointer text-slate-500 hover:text-slate-700 select-none py-1">
            👁 Xem trước HTML
          </summary>
          <div
            className="mt-2 p-3 border border-slate-200 rounded-md bg-white prose prose-sm max-w-none text-slate-700 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
          />
        </details>
      )}
    </div>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────
export default function ContentDialog({ open, onOpenChange, content }: ContentDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!content;

  type FormOutput = z.output<typeof formSchema>;

  const form = useForm<FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: { key: "", value: "", type: "text", label: "" },
  });

  const contentType = useWatch({
    control: form.control,
    name: "type",
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
    } else {
      form.reset({ key: "", value: "", type: "text", label: "" });
    }
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
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Cập nhật nội dung" : "Thêm nội dung mới"}</DialogTitle>
          <DialogDescription>Quản lý nội dung CMS cho các trang công khai.</DialogDescription>
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
                    <Input placeholder="VD: Mô tả dịch vụ gia công" {...field} />
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
                      <Input placeholder="dich_vu_gia_cong_mo_ta" {...field} disabled={isEditing} />
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
                        <SelectItem value="text">📝 Text</SelectItem>
                        <SelectItem value="html">🔧 HTML (có chèn ảnh)</SelectItem>
                        <SelectItem value="image">🖼️ Ảnh</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Value field — varies by type */}
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {contentType === "image" ? "Ảnh" : "Nội dung"}
                  </FormLabel>
                  <FormControl>
                    {contentType === "image" ? (
                      <ImageUploadZone value={field.value} onChange={field.onChange} />
                    ) : contentType === "html" ? (
                      <HtmlEditor value={field.value} onChange={field.onChange} />
                    ) : (
                      <Textarea
                        className="min-h-[180px]"
                        placeholder="Nhập nội dung text..."
                        {...field}
                      />
                    )}
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
