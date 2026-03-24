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
      <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
        <Settings className="w-20 h-20 text-slate-300 opacity-50" />
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Ảnh chính */}
      <div className="aspect-square bg-white rounded-xl overflow-hidden border border-slate-200 relative p-4 flex items-center justify-center">
        <Image
          src={activeImage.url}
          alt={activeImage.alt || productName}
          fill
          className="object-contain p-4"
          priority
        />
      </div>

      {/* Thumbnails (nếu có nhiều hơn 1) */}
      {images.length > 1 && (
        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 snap-x">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 overflow-hidden bg-white relative transition-all ${
                idx === activeIndex ? "border-blue-600 shadow-sm" : "border-slate-200 opacity-70 hover:opacity-100 cursor-pointer hover:border-blue-300"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} hình ${idx + 1}`}
                fill
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
