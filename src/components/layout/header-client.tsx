"use client";

import Link from "next/link";
import {
  Search,
  Phone,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
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
    { name: "Sản Phẩm", href: "/san-pham", isProduct: true },
    { name: "Gia Công CNC", href: "/dich-vu" },
    { name: "Giới Thiệu", href: "/gioi-thieu" },
    { name: "Liên Hệ", href: "/lien-he" },
  ];

  const productTopCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  );

  const categoryChildrenMap = useMemo(() => {
    const map = new Map<number, HeaderCategory[]>();
    for (const cat of categories) {
      if (!cat.parentId) continue;
      const list = map.get(cat.parentId) || [];
      list.push(cat);
      map.set(cat.parentId, list);
    }
    return map;
  }, [categories]);

  const [activeMegaCat, setActiveMegaCat] = useState<number | null>(
    productTopCategories[0]?.id || null,
  );

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-border shadow-sm font-sans">
      {/* ── Tầng 1: Block Thông Tin Cơ Bản ── */}
      <div className="bg-slate-900 text-xs text-slate-300 py-1.5 px-4 hidden sm:block border-b border-primary/20">
        <div className="container mx-auto flex justify-between items-center">
          <p>Hệ thống phân phối dụng cụ cơ khí & vật tư công nghiệp chính hãng</p>
          <div className="flex space-x-6 text-slate-200">
            <span>Email: admin@ckkh.vn</span>
            <span className="text-white font-semibold bg-primary px-2 rounded-sm">Hotline: 090 123 4567</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 lg:gap-8 h-20">

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

          {/* Search — desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl relative shadow-sm"
          >
            <input
              type="text"
              placeholder="Tìm kiếm mã SKU, tên sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-4 pr-12 text-sm bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:border-primary focus:bg-white transition-colors placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 bottom-0 px-4 bg-slate-800 hover:bg-primary text-white transition-colors flex items-center justify-center font-semibold"
            >
               TÌM
            </button>
          </form>

          {/* Actions — desktop */}
          <div className="hidden lg:flex items-center gap-6 shrink-0 ml-auto h-full">
            <Link href="/bao-gia" className="flex items-center h-full">
              <div className="relative flex items-center gap-3 bg-white hover:bg-blue-50 border border-slate-200 px-4 h-10 transition-all group cursor-pointer shadow-sm hover:shadow">
                <ShoppingCart className="w-4 h-4 text-slate-700 group-hover:text-primary transition-colors" />
                <span className="text-sm font-semibold text-slate-700 group-hover:text-primary">Giỏ Yêu Cầu</span>
                <QuoteCartBadge className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center shadow-sm" />
              </div>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center gap-4 ml-auto">
            <Link href="/bao-gia" className="relative text-slate-700 hover:text-primary">
              <ShoppingCart className="w-6 h-6" />
              <QuoteCartBadge className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center" />
            </Link>
            <button
              className="p-1 text-slate-700 hover:text-primary transition-colors"
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

      {/* ── Tầng 3: Menu Kỹ Thuật (Desktop) ── */}
      <nav className="bg-white hidden lg:block border-t border-slate-100">
        <div className="container mx-auto px-4 sm:px-6">
          <ul className="flex items-center">
            {navLinks.map((link) => (
              <li key={link.href} className="relative group border-r border-slate-100 first:border-l">
                <Link
                  href={link.href}
                  className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors uppercase tracking-wide relative"
                >
                  {link.name}
                  {link.isProduct && (
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                  )}
                </Link>

                {/* Mega Menu Dạng Clean Boxy */}
                {link.isProduct && (
                  <div className="absolute left-[-1px] top-full pt-[1px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50">
                    <div className="w-[800px] flex bg-white border border-slate-200 shadow-xl overflow-hidden">
                      {/* Parent categories */}
                      <div className="w-[260px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
                        <Link
                          href="/san-pham"
                          className="px-4 py-4 text-sm font-bold text-white bg-slate-800 hover:bg-primary transition-colors flex items-center gap-2"
                        >
                          <Menu className="w-4 h-4" /> Danh mục sản phẩm
                        </Link>
                        <div className="flex-1 overflow-y-auto max-h-[400px]">
                          {productTopCategories.map((cat) => {
                            const hasChildren =
                              (categoryChildrenMap.get(cat.id) || []).length > 0;
                            const isActive = activeMegaCat === cat.id;
                            return (
                              <div
                                key={cat.id}
                                className={`flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium border-b border-slate-100 transition-colors ${
                                  isActive
                                    ? "bg-white text-primary border-l-4 border-l-primary"
                                    : "text-slate-700 hover:bg-slate-100 hover:text-primary border-l-4 border-l-transparent"
                                }`}
                                onMouseEnter={() => setActiveMegaCat(cat.id)}
                              >
                                <Link href={`/san-pham/${cat.slug}`} className="flex-1">
                                  {cat.name}
                                </Link>
                                {hasChildren && (
                                  <ChevronRight
                                    className={`w-4 h-4 ${isActive ? "text-primary" : "text-slate-400"}`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Children Data Grid */}
                      <div className="flex-1 p-6 overflow-y-auto max-h-[450px] relative bg-white">
                        <div className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
                          <span>{productTopCategories.find((c) => c.id === activeMegaCat)?.name}</span>
                        </div>
                        {activeMegaCat &&
                        (categoryChildrenMap.get(activeMegaCat) || []).length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                            {(categoryChildrenMap.get(activeMegaCat) || []).map((child) => (
                              <Link
                                key={child.id}
                                href={`/san-pham/${child.slug}`}
                                className="flex items-center group/child bg-white border border-slate-200 hover:border-primary hover:bg-blue-50 transition-all p-3 shadow-sm hover:shadow-md"
                              >
                                <span className="text-sm text-slate-700 group-hover/child:text-primary font-medium leading-snug">
                                  {child.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-10 mt-10 border border-dashed border-slate-300 text-slate-500 bg-slate-50">
                            <span className="mb-2">Chưa có danh mục con</span>
                            <Link
                              href={`/san-pham/${productTopCategories.find((c) => c.id === activeMegaCat)?.slug}`}
                              className="px-6 py-2 bg-primary text-white font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm mt-2"
                            >
                              Xem tất cả
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-lg">
          {/* Mobile search */}
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
