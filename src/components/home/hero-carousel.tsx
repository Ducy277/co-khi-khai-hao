"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Banner = {
  id: number;
  title?: string | null;
  image: string;
  link?: string | null;
};

export default function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full relative min-h-[220px] lg:min-h-[350px] flex items-stretch border border-slate-200 overflow-hidden bg-slate-900 group shrink-0 rounded-2xl shadow-sm">
        <Image 
          src="/hero_banner_machining.png" 
          alt="Banner" 
          fill 
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div className="w-full relative min-h-[220px] lg:min-h-[350px] flex items-stretch border border-slate-200 overflow-hidden bg-slate-900 group shrink-0 rounded-2xl shadow-sm">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {banner.link ? (
            <Link href={banner.link} className="absolute inset-0 z-20">
              <Image 
                src={banner.image} 
                alt={banner.title || `Banner ${index + 1}`} 
                fill 
                className="object-cover"
                priority={index === 0}
              />
            </Link>
          ) : (
            <Image 
              src={banner.image} 
              alt={banner.title || `Banner ${index + 1}`} 
              fill 
              className="object-cover"
              priority={index === 0}
            />
          )}
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-all text-slate-800"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-all text-slate-800"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? "bg-primary w-6" : "bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
