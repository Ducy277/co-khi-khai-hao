"use client";

import Link from "next/link";
import {
  Search,
  Phone,
  ShoppingCart,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import QuoteCartBadge from "@/components/quote/quote-cart-badge";

type HeaderCategory = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

type HeaderClientProps = {
  categories: HeaderCategory[];
};

export default function HeaderClient({ categories }: HeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/san-pham?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { name: "Trang Chủ", href: "/" },
    { name: "Gia Công CNC", href: "/dich-vu" },
    { name: "Giới Thiệu", href: "/gioi-thieu" },
    { name: "Liên Hệ", href: "/lien-he" },
  ];

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-border shadow-sm font-sans">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20 gap-4 lg:gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-12 h-12 bg-primary flex items-center justify-center transition-all group-hover:bg-blue-700">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            <div className="leading-none flex flex-col justify-center">
              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Cơ Khí</div>
              <div className="text-xl font-bold text-slate-900 uppercase tracking-tight">Khải Hào</div>
            </div>
          </Link>

          {/* Navigation Links — Desktop */}
          <nav className="hidden lg:flex items-center h-full">
            <ul className="flex items-center h-full">
              {navLinks.map((link) => (
                <li key={link.href} className="relative group h-full flex items-center">
                  <Link
                    href={link.href}
                    className="flex items-center justify-center gap-1.5 px-3 xl:px-4 py-2 text-[13px] xl:text-sm font-semibold text-slate-700 hover:text-primary transition-colors uppercase tracking-wide"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Search — Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex flex-1 max-w-sm xl:max-w-md relative shadow-sm"
          >
            <input
              type="text"
              placeholder="Bản mã, phụ tùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-4 pr-12 text-sm bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:border-primary focus:bg-white transition-colors placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 bottom-0 px-3 bg-slate-800 hover:bg-primary text-white transition-colors flex items-center justify-center"
            >
               <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Cart Actions */}
          <div className="flex items-center gap-4 shrink-0 ml-auto lg:ml-0 h-full">
            {/* Desktop Cart */}
            <Link href="/bao-gia" className="hidden lg:flex items-center gap-2 group p-2 relative text-slate-700 hover:text-primary transition-colors h-full">
              <ShoppingCart className="w-7 h-7" strokeWidth={1.5} />
              <QuoteCartBadge className="absolute top-1/2 right-1 -translate-y-[120%] bg-primary text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm" />
            </Link>

            {/* Mobile Actions */}
            <Link href="/bao-gia" className="lg:hidden relative text-slate-700 hover:text-primary flex items-center mr-2">
              <ShoppingCart className="w-7 h-7" strokeWidth={1.5} />
              <QuoteCartBadge className="absolute -top-1 -right-2 bg-primary text-white text-[11px] font-bold w-4 h-4 flex items-center justify-center rounded-full" />
            </Link>
            <button
              className="lg:hidden p-1 text-slate-700 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-lg absolute w-full left-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <form onSubmit={handleSearch} className="relative flex shadow-sm">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-10 pl-3 text-sm bg-white text-slate-900 border border-r-0 border-slate-300 outline-none focus:border-primary rounded-none"
              />
              <button
                type="submit"
                className="px-4 bg-slate-800 text-white hover:bg-primary transition-colors font-semibold border-y border-r border-slate-800"
              >
                TÌM
              </button>
            </form>
          </div>
          <ul className="">
            {navLinks.map((link) => (
              <li key={link.href} className="border-b border-slate-100">
                <Link
                  href={link.href}
                  className="block px-6 py-4 text-sm font-semibold text-slate-800 hover:text-primary hover:bg-slate-50 transition-colors uppercase"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li className="px-6 py-5 bg-blue-50 mt-2 border-t border-blue-100">
              <a href="tel:0901234567" className="flex items-center gap-3 text-primary font-bold">
                <div className="w-8 h-8 bg-primary text-white flex flex-col items-center justify-center shadow-sm">
                  <Phone className="w-4 h-4 fill-current" />
                </div>
                Hotline: 090 123 4567
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
