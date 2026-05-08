"use client";

import { useState } from "react";
import Image from "next/image";
import { Settings } from "lucide-react";

type ProductImage = {
  id: number;
  url: string;
  alt: string | null;
};

export default function ProductGallery({ images, productName }: { images: ProductImage[], productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <Settings className="w-16 h-16 text-slate-300 opacity-50" />
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col w-full h-full gap-3">
      {/* Ảnh chính - chiếm hết chiều cao còn lại */}
      <div className="relative flex-1 min-h-0 w-full bg-white rounded-lg overflow-hidden border border-slate-200">
        <Image
          src={activeImage.url}
          alt={activeImage.alt || productName}
          fill
          className="object-contain p-3"
          priority
        />
      </div>

      {/* Thumbnails (nếu có nhiều hơn 1) */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto pb-1 snap-x shrink-0">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className={`shrink-0 w-14 h-14 rounded border-2 overflow-hidden bg-white relative transition-all ${
                idx === activeIndex ? "border-blue-600 shadow-sm" : "border-slate-200 opacity-70 hover:opacity-100 cursor-pointer hover:border-blue-300"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} hình ${idx + 1}`}
                fill
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
