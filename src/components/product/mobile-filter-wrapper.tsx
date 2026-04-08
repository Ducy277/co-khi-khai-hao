"use client";

import React, { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileFilterWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent background scrolling when bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Sticky Bottom Trigger */}
      <div 
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-slate-200 rounded-t-xl pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)] cursor-pointer transition-transform duration-300 ${isOpen ? 'translate-y-full' : 'translate-y-0'}`}
        onClick={() => setIsOpen(true)}
      >
        <div className="flex flex-col items-center justify-center pt-2 pb-3">
          <div className="w-10 h-1.5 bg-slate-200 rounded-full mb-2"></div>
          <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700 uppercase tracking-widest">
            <Filter className="w-4 h-4 text-primary" /> Bộ Lọc
          </div>
        </div>
      </div>

      {/* Desktop View: Hiển thị bộ lọc cố định bên trái (20% width) */}
      <div className="hidden lg:block w-[20%] shrink-0 border-r border-slate-100 pr-6">
        <div className="w-full sticky top-24 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>

      {/* Mobile View: Bottom Sheet Filter */}
      {/* Backdrop */}
      <div 
        className={`lg:hidden fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sheet Content */}
      <div 
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-2xl transition-transform duration-300 ease-out transform ${isOpen ? "translate-y-0" : "translate-y-full"} flex flex-col max-h-[85vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]`}
      >
        {/* Drag handle & Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
             <Filter className="w-5 h-5 text-primary" />
             <h3 className="font-bold text-slate-900 text-lg">Bộ lọc</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Scrollable content container */}
        <div className="flex-1 overflow-hidden flex flex-col w-full min-h-0">
          {React.isValidElement<{ onClose?: () => void }>(children)
            ? React.cloneElement(children, { onClose: () => setIsOpen(false) })
            : children}
        </div>
      </div>
    </>
  );
}
