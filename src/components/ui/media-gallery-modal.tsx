"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MediaGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

export function MediaGalleryModal({ open, onOpenChange, onSelect }: MediaGalleryModalProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      fetchImages();
    }
  }, [open]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/upload/library");
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } catch (error) {
      console.error("Failed to fetch library", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter((img) =>
    img.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 shrink-0">
          <DialogTitle>Thư viện ảnh đã lưu</DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-3 border-b border-slate-100 shrink-0 bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Không tìm thấy ảnh nào.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filteredImages.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSelect(url);
                    onOpenChange(false);
                  }}
                  className="relative aspect-square rounded-lg border-2 border-transparent hover:border-blue-500 overflow-hidden bg-white shadow-sm transition-all group"
                >
                  <Image
                    src={url}
                    alt={url}
                    fill
                    className="object-contain p-1 mix-blend-multiply"
                    sizes="(max-width: 640px) 33vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] truncate px-1 py-0.5 opacity-0 group-hover:opacity-100">
                    {url.split('/').pop()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
