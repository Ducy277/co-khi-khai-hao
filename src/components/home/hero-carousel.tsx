"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Banner = {
  id: number;
  title?: string | null;
  image: string;
  link?: string | null;
};

const WRAPPER_CLASS =
  "w-full relative min-h-[220px] lg:min-h-[350px] flex items-stretch border border-slate-200 overflow-hidden bg-slate-900 group shrink-0 rounded-2xl shadow-sm";

function BannerImage({ banner, index }: { banner: Banner; index: number }) {
  const imgEl = (
    <Image
      src={banner.image}
      alt={banner.title || `Banner ${index + 1}`}
      fill
      className="object-cover"
      // First banner: eager + fetchpriority=high for LCP
      priority={index === 0}
      loading={index === 0 ? "eager" : "lazy"}
      sizes="(max-width: 1024px) 100vw, 80vw"
    />
  );

  if (banner.link) {
    return (
      <Link href={banner.link} className="absolute inset-0 z-20">
        {imgEl}
      </Link>
    );
  }
  return imgEl;
}

export default function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Hydration guard: keep first slide visible in SSR HTML so LCP is discoverable
  const [hydrated, setHydrated] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const startTimer = () => {
    if (!banners || banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
  };

  useEffect(() => {
    if (!hydrated) return;
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, banners]);

  const prevSlide = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (!banners || banners.length === 0) {
    return (
      <div className={WRAPPER_CLASS}>
        <Image
          src="/hero_banner_machining.png"
          alt="Banner Cơ Khí Khải Hào"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 80vw"
        />
      </div>
    );
  }

  return (
    <div className={WRAPPER_CLASS}>
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 ${
            hydrated ? "transition-opacity duration-700" : ""
          } ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          // Before hydration: hide non-first slides so first image is in initial HTML
          style={!hydrated && index !== 0 ? { display: "none" } : undefined}
        >
          <BannerImage banner={banner} index={index} />
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Banner trước"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-all text-slate-800"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Banner tiếp theo"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-all text-slate-800"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Chuyển đến banner ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? "bg-primary w-6"
                    : "w-2.5 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
