"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
};

export default function PaginationControls({
  currentPage,
  totalPages,
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [jumpPage, setJumpPage] = useState("");

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const getPaginationRange = () => {
    const delta = 1;
    const range: (number | string)[] = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }
    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }
    return range;
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpPage, 10);
    if (target && target >= 1 && target <= totalPages) {
      router.push(buildHref(target), { scroll: false });
    }
    setJumpPage("");
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 mb-8">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* First */}
        <Link
          href={buildHref(1)}
          className={`w-10 h-10 flex items-center justify-center text-sm font-medium transition-colors rounded-lg border ${
            currentPage === 1
              ? "bg-slate-100 text-slate-400 border-slate-200 pointer-events-none"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-blue-600 hover:border-slate-400"
          }`}
          aria-label="Trang đầu"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Link>

        {/* Prev */}
        <Link
          href={buildHref(Math.max(1, currentPage - 1))}
          className={`w-10 h-10 flex items-center justify-center text-sm font-medium transition-colors rounded-lg border ${
            currentPage === 1
              ? "bg-slate-100 text-slate-400 border-slate-200 pointer-events-none"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-blue-600 hover:border-slate-400"
          }`}
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>

        {/* Pages */}
        {getPaginationRange().map((item, idx) => {
          if (item === "...") {
            return (
              <span key={`dots-${idx}`} className="px-2 text-slate-400">
                ...
              </span>
            );
          }
          const pageNum = item as number;
          const isActive = pageNum === currentPage;
          return (
            <Link
              key={pageNum}
              href={buildHref(pageNum)}
              className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-all border ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 pointer-events-none"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 hover:text-blue-600"
              }`}
            >
              {pageNum}
            </Link>
          );
        })}

        {/* Next */}
        <Link
          href={buildHref(Math.min(totalPages, currentPage + 1))}
          className={`w-10 h-10 flex items-center justify-center text-sm font-medium transition-colors rounded-lg border ${
            currentPage === totalPages
              ? "bg-slate-100 text-slate-400 border-slate-200 pointer-events-none"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-blue-600 hover:border-slate-400"
          }`}
          aria-label="Trang tiếp"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>

        {/* Last */}
        <Link
          href={buildHref(totalPages)}
          className={`w-10 h-10 flex items-center justify-center text-sm font-medium transition-colors rounded-lg border ${
            currentPage === totalPages
              ? "bg-slate-100 text-slate-400 border-slate-200 pointer-events-none"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-blue-600 hover:border-slate-400"
          }`}
          aria-label="Trang cuối"
        >
          <ChevronsRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex items-center gap-2 pl-4 sm:border-l border-slate-200">
        <span className="text-sm text-slate-600 hidden sm:inline">Đến:</span>
        <form onSubmit={handleJump} className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            placeholder="Trang..."
            className="w-16 h-10 border border-slate-300 rounded-md px-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="h-10 px-3 bg-slate-800 text-white text-sm font-semibold rounded-md hover:bg-blue-600 transition-colors"
          >
            ĐI
          </button>
        </form>
      </div>
    </div>
  );
}
