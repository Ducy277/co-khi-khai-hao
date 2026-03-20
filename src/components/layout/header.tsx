"use client";

import Link from "next/link";
import { Search, Phone, ShoppingCart, Menu, X, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
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
    { name: "Sản phẩm", href: "/san-pham" },
    { name: "Gia công cơ khí", href: "/dich-vu" },
    { name: "Giới thiệu", href: "/gioi-thieu" },
    { name: "Liên hệ", href: "/lien-he" },
  ];

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-200">
      {/* Top bar (Optional - can be for small announcements) */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 hidden sm:block">
        <div className="container mx-auto flex justify-between items-center">
          <p>Nhà cung cấp Phụ tùng Cơ khí & Dịch vụ gia công chuyên nghiệp</p>
          <div className="flex space-x-4">
            <span>Email: admin@ckkh.vn</span>
            <span>Hotline: 090 123 4567</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
              <Settings className="w-6 h-6 animate-spin-slow" /> 
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight uppercase tracking-wide">Cơ Khí<br/><span className="text-blue-700">Khải Hào</span></h1>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-grow max-w-2xl relative">
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

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium uppercase font-semibold">Hotline tư vấn</span>
                <span className="text-sm font-bold text-slate-800">090 123 4567</span>
              </div>
            </div>

            <Link href="/bao-gia">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center gap-2 relative">
                <ShoppingCart className="w-5 h-5" />
                <span>Giỏ báo giá</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">0</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <Link href="/bao-gia" className="relative text-slate-600">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">0</span>
            </Link>
            <button 
              className="text-slate-600 p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Only visible on small screens below md) */}
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

      {/* Navigation Bar */}
      <nav className={`bg-slate-900 lg:block ${isMobileMenuOpen ? 'block absolute w-full left-0 top-full' : 'hidden'}`}>
        <div className="container mx-auto px-4">
          <ul className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-8 py-4 lg:py-0">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className="block py-2 text-slate-300 hover:text-white font-medium text-sm md:text-base uppercase tracking-wider transition-colors border-b border-slate-800 lg:border-none lg:py-4 relative group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                  {/* Underline hover effect for desktop */}
                  <span className="absolute bottom-0 left-0 w-0 h-1 bg-blue-500 transition-all duration-300 group-hover:w-full hidden lg:block"></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
