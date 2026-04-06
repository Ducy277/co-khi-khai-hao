"use client";

import { useState } from "react";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileFilterWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Nút hiển thị trên Mobile */}
      <div className="lg:hidden w-full mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between h-12 bg-white border border-slate-200 text-slate-800 font-bold tracking-wide rounded-none shadow-sm"
        >
          <span className="flex items-center gap-2 uppercase text-xs">
            <Filter className="w-4 h-4 text-primary" /> 
            {isOpen ? "Thu gọn Bộ Lọc" : "Hiển thị Bộ Lọc (Toàn bộ)"}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </Button>
      </div>

      {/* Nội dung Sidebar chứa Filter (Mặc định ẩn trên Mobile nếu k click, luôn hiện trên Desktop) */}
      <div className={`${isOpen ? "block" : "hidden"} lg:block w-full lg:w-64 shrink-0 bg-white border border-slate-200 p-5 shadow-sm`}>
        {children}
      </div>
    </>
  );
}
