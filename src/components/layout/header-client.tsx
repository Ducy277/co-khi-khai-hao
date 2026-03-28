"use client";

import Link from "next/link";
import {
  Search,
  Phone,
  ShoppingCart,
  Menu,
  X,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
    { name: "Trang chủ", href: "/" },
    { name: "Sản phẩm", href: "/san-pham", isProduct: true },
    { name: "Gia công cơ khí", href: "/dich-vu" },
    { name: "Giới thiệu", href: "/gioi-thieu" },
    { name: "Liên hệ", href: "/lien-he" },
  ];

  const productTopCategories = useMemo(
    () => categories.filter((category) => !category.parentId),
    [categories],
  );

  const categoryChildrenMap = useMemo(() => {
    const map = new Map<number, HeaderCategory[]>();
    for (const category of categories) {
      if (!category.parentId) continue;
      const list = map.get(category.parentId) || [];
      list.push(category);
      map.set(category.parentId, list);
    }
    return map;
  }, [categories]);

  const [activeMegaCat, setActiveMegaCat] = useState<number | null>(productTopCategories[0]?.id || null);

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-200">
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 hidden sm:block">
        <div className="container mx-auto flex justify-between items-center">
          <p>Nhà cung cấp Phụ tùng Cơ khí & Dịch vụ gia công chuyên nghiệp</p>
          <div className="flex space-x-4">
            <span>Email: admin@ckkh.vn</span>
            <span>Hotline: 090 123 4567</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight uppercase tracking-wide">
                Cơ Khí
                <br />
                <span className="text-blue-700">Khải Hào</span>
              </h1>
            </div>
          </Link>

          <div className="hidden md:block grow max-w-2xl relative">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm, mã SKU..."
                className="w-full pl-4 pr-12 py-2 rounded-full border-2 border-blue-100 focus-visible:ring-blue-500 focus-visible:border-blue-500 bg-slate-50 transition-all text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex items-center justify-center"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          <div className="hidden lg:flex items-center space-x-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase font-semibold">
                  Hotline tư vấn
                </span>
                <span className="text-sm font-bold text-slate-800">090 123 4567</span>
              </div>
            </div>

            <Link href="/bao-gia">
              <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center gap-2 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Giỏ báo giá</span>
                <QuoteCartBadge className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm" />
              </Button>
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <Link href="/bao-gia" className="relative text-slate-600">
              <ShoppingCart className="w-6 h-6" />
              <QuoteCartBadge className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full" />
            </Link>
            <button
              className="text-slate-600 p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-4 pr-12 rounded-full border-slate-300 bg-slate-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600 text-white rounded-full flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <nav
        className={`bg-slate-900 lg:block ${
          isMobileMenuOpen ? "block absolute w-full left-0 top-full" : "hidden"
        }`}
      >
        <div className="container mx-auto px-4">
          <ul className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-8 py-4 lg:py-0">
            {navLinks.map((link) => (
              <li key={link.href} className="relative lg:group">
                <Link
                  href={link.href}
                  className="block py-2 text-slate-300 hover:text-white font-medium text-sm md:text-base uppercase tracking-wider transition-colors border-b border-slate-800 lg:border-none lg:py-4 relative group/link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="inline-flex items-center gap-1">
                    {link.name}
                    {link.isProduct ? (
                      <ChevronDown className="w-4 h-4 hidden lg:inline-block" />
                    ) : null}
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-1 bg-blue-500 transition-all duration-300 group-hover/link:w-full hidden lg:block" />
                </Link>

                {link.isProduct ? (
                  <div className="hidden lg:block absolute left-0 top-full pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <div className="w-[700px] h-[360px] flex rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                      {/* Cột Danh mục Cha */}
                      <div className="w-1/3 bg-slate-50 border-r border-slate-100 py-3 flex flex-col">
                        <Link
                          href="/san-pham"
                          className="mx-3 px-3 py-2 rounded-lg text-sm font-bold text-blue-700 hover:bg-slate-200/50 mb-2 transition-colors"
                        >
                          Tất cả sản phẩm
                        </Link>
                        
                        <div className="flex-1 overflow-y-auto px-3 space-y-1">
                          {productTopCategories.map((category) => {
                            const hasChildren = (categoryChildrenMap.get(category.id) || []).length > 0;
                            const isActive = activeMegaCat === category.id;
                            
                            return (
                              <div
                                key={category.id}
                                className={`rounded-lg cursor-pointer flex items-center justify-between px-3 py-2 text-sm font-medium transition-colors ${
                                  isActive ? "bg-white text-blue-700 shadow-sm border border-slate-100" : "text-slate-700 hover:bg-slate-200/50 transparent border border-transparent"
                                }`}
                                onMouseEnter={() => setActiveMegaCat(category.id)}
                              >
                                <Link href={`/san-pham/${category.slug}`} className="flex-1">
                                  {category.name}
                                </Link>
                                {hasChildren ? (
                                  <ChevronRight className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cột Danh mục Con */}
                      <div className="w-2/3 bg-white p-6 overflow-y-auto">
                        <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                          {productTopCategories.find(c => c.id === activeMegaCat)?.name || "Danh mục"}
                        </h3>
                        
                        {activeMegaCat && (categoryChildrenMap.get(activeMegaCat) || []).length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                            {(categoryChildrenMap.get(activeMegaCat) || []).map(child => (
                              <Link
                                key={child.id}
                                href={`/san-pham/${child.slug}`}
                                className="block p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:shadow-sm hover:bg-blue-50/50 transition-all group/child"
                              >
                                <span className="text-sm font-medium text-slate-700 group-hover/child:text-blue-700 block">
                                  {child.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="h-[200px] flex flex-col items-center justify-center text-slate-400">
                            <span className="text-sm">Xem tất cả sản phẩm trong nhóm này</span>
                            <Link 
                              href={`/san-pham/${productTopCategories.find(c => c.id === activeMegaCat)?.slug}`} 
                              className="mt-3 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full font-medium text-sm hover:bg-blue-100 transition-colors"
                            >
                              Xem ngay
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
