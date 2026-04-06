"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import {
  Menu, X, LayoutDashboard, Package, FolderOpen, Tags, Wrench,
  ClipboardList, Image as ImageIcon, FileText, LogOut
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Sản phẩm", href: "/admin/san-pham", icon: Package },
  { label: "Danh mục", href: "/admin/danh-muc", icon: FolderOpen },
  { label: "Thương hiệu", href: "/admin/thuong-hieu", icon: Tags },
  { label: "Thuộc tính lọc", href: "/admin/thuoc-tinh", icon: Wrench },
  { label: "Yêu cầu báo giá", href: "/admin/bao-gia", icon: ClipboardList },
  { label: "Banner", href: "/admin/banner", icon: ImageIcon },
  { label: "Nội dung", href: "/admin/noi-dung", icon: FileText },
];

export default function AdminSidebar({
  user,
}: {
  user: Session["user"];
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-60 p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col min-h-screen fixed lg:sticky top-0 z-50 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800 bg-slate-950">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded flex items-center justify-center border border-blue-500 shadow-sm">
            <span className="text-white font-bold text-sm tracking-widest">CK</span>
          </div>
          <div>
            <p className="font-bold text-sm text-white uppercase tracking-wider">Khải Hào</p>
            <p className="text-xs text-slate-400">Quản trị viên</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-none border-l-2 text-sm transition-all font-medium ${
                isActive
                  ? "bg-slate-800 text-white border-blue-500"
                  : "border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "text-slate-500"}`} strokeWidth={isActive ? 2 : 1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name || "Admin"}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-400 hover:text-white border border-slate-800 px-3 py-2 hover:bg-slate-800 transition-colors uppercase tracking-wider"
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
      </div>
    </aside>
    </>
  );
}
