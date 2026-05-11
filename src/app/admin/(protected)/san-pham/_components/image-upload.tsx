"use client";

import { useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MediaGalleryModal } from "@/components/ui/media-gallery-modal";

interface ImageUploadItem {
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface ImageUploadProps {
  value: ImageUploadItem[];
  onChange: (value: ImageUploadItem[]) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files);
    
    const newImages: ImageUploadItem[] = [...value];
    
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} không phải là hình ảnh.`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        const data = await res.json();
        
        if (data.url) {
          newImages.push({
            url: data.url,
            alt: "",
            isPrimary: newImages.length === 0, // Ảnh đầu tiên tải lên là primary
            sortOrder: newImages.length,
          });
        }
      } catch (error) {
        toast.error(`Lỗi tải lên file ${file.name}`);
        console.error(error);
      }
    }

    onChange(newImages);
    setIsUploading(false);
    
    // Reset input
    e.target.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    const updated = value.filter((_, index) => index !== indexToRemove);
    // Nếu xóa cái đang isPrimary mà mảng còn ảnh, set cái đầu tiên thành isPrimary
    if (value[indexToRemove]?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const setPrimary = (indexToSet: number) => {
    const updated = value.map((img, index) => ({
      ...img,
      isPrimary: index === indexToSet
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-3" />
            ) : (
              <UploadCloud className="w-8 h-8 text-slate-400 mb-3" />
            )}
            <p className="mb-2 text-sm text-slate-500">
              <span className="font-semibold">{isUploading ? "Đang tải ảnh lên..." : "Click để tải lên"}</span> hoặc kéo thả (Hỗ trợ nhiều file)
            </p>
            <p className="text-xs text-slate-500">PNG, JPG, WEBP (MAX. 5MB)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      
      <div className="flex gap-2 items-center w-full">
        <input
          type="text"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          placeholder="Hoặc nhập URL ảnh đã có trên hệ thống..."
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (manualUrl) {
                const newImages = [...value];
                newImages.push({
                  url: manualUrl,
                  alt: "",
                  isPrimary: newImages.length === 0,
                  sortOrder: newImages.length,
                });
                onChange(newImages);
                setManualUrl("");
              }
            }
          }}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (manualUrl) {
              const newImages = [...value];
              newImages.push({
                url: manualUrl,
                alt: "",
                isPrimary: newImages.length === 0,
                sortOrder: newImages.length,
              });
              onChange(newImages);
              setManualUrl("");
            }
          }}
        >
          Thêm URL
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsGalleryOpen(true)}
        >
          Thư viện ảnh
        </Button>
      </div>

      <MediaGalleryModal
        open={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        onSelect={(url) => {
          const newImages = [...value];
          newImages.push({
            url,
            alt: "",
            isPrimary: newImages.length === 0,
            sortOrder: newImages.length,
          });
          onChange(newImages);
        }}
      />

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {value.map((img, index) => (
            <div key={index} className={`relative rounded-lg overflow-hidden border-2 group ${img.isPrimary ? 'border-blue-500' : 'border-slate-200'}`}>
              <div className="aspect-square relative flex items-center justify-center bg-slate-100">
                <Image
                  src={img.url}
                  alt={img.alt || `Preview ${index}`}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    removeImage(index);
                  }}
                  className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!img.isPrimary && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-xs h-7 bg-white/90 shadow-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      setPrimary(index);
                    }}
                  >
                    Bìa (Cover)
                  </Button>
                </div>
              )}
              
              {img.isPrimary && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  COVER
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
