"use client";


export default function ZaloButton() {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-110 flex flex-col items-center gap-2">
      <a 
        href="https://zalo.me/0901234567" 
        target="_blank" 
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#0068FF] shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform group"
      >
        <div className="absolute inset-0 rounded-full bg-[#0068FF] opacity-30 animate-ping"></div>
        <div className="absolute w-[44px] h-[44px] bg-white rounded-full flex items-center justify-center">
          {/* Zalo Icon Simple Format */}
          <span className="text-[#0068FF] font-bold text-xl tracking-tighter ml-px">Zalo</span>
        </div>

        {/* Tooltip */}
        <span className="absolute right-16 bg-white text-slate-800 px-3 py-1.5 rounded-lg shadow-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-100 pointer-events-none">
          <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-r border-t border-slate-100 rotate-45"></span>
          Chat với chúng tôi
        </span>
      </a>
    </div>
  );
}
