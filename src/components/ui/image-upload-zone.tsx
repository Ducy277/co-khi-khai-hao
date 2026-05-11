"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaGalleryModal } from "./media-gallery-modal";

export function ImageUploadZone({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh (JPG, PNG, WebP, GIF...)");
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
        onChange(data.url);
        toast.success("Tải ảnh lên thành công!");
      } else {
        toast.error(data.error || "Tải ảnh thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối khi tải ảnh lên");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-all
          ${isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"}
          ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-500">Đang tải lên...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
              <Upload className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Kéo thả ảnh vào đây</p>
              <p className="text-xs text-slate-400 mt-0.5">hoặc click để chọn từ máy tính</p>
            </div>
            <p className="text-xs text-slate-400">JPG, PNG, WebP, GIF — tối đa 5MB</p>
          </>
        )}
      </div>

      {/* URL input manual override */}
      <div className="flex gap-2 items-center">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Hoặc nhập URL ảnh trực tiếp..."
          className="text-sm flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={() => setIsGalleryOpen(true)}
          title="Chọn từ thư viện"
          className="shrink-0 w-10 h-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        </Button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 text-slate-400 hover:text-red-500 transition-colors"
            title="Xóa ảnh"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <MediaGalleryModal
        open={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        onSelect={(url) => {
          onChange(url);
        }}
      />

      {/* Preview */}
      {value && (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <div className="relative w-full h-48">
            <Image
              src={value}
              alt="preview"
              fill
              className="object-contain"
              onError={() => {/* keep url, might be valid later */}}
            />
          </div>
          <p className="text-xs text-slate-400 px-3 py-2 border-t border-slate-100 break-all">{value}</p>
        </div>
      )}
    </div>
  );
}
