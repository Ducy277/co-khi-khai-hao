"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "🏠" },
  { label: "Sản phẩm", href: "/admin/san-pham", icon: "📦" },
  { label: "Danh mục", href: "/admin/danh-muc", icon: "🗂️" },
  { label: "Thương hiệu", href: "/admin/thuong-hieu", icon: "🏷️" },
  { label: "Thuộc tính lọc", href: "/admin/thuoc-tinh", icon: "🔧" },
  { label: "Yêu cầu báo giá", href: "/admin/bao-gia", icon: "📋" },
  { label: "Banner", href: "/admin/banner", icon: "🖼️" },
  { label: "Nội dung", href: "/admin/noi-dung", icon: "📝" },
];

export default function AdminSidebar({
  user,
}: {
  user: Session["user"];
}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-blue-950 text-white flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-blue-900">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <span className="text-blue-900 font-bold text-sm">CK</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Cơ Khí Khải Hào</p>
            <p className="text-xs text-blue-300">Quản trị viên</p>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-800 text-white font-medium"
                  : "text-blue-200 hover:bg-blue-900 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-blue-900">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
            <p className="text-xs text-blue-300 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full text-left text-xs text-blue-300 hover:text-white px-3 py-2 rounded-lg hover:bg-blue-900 transition-colors"
        >
          🚪 Đăng xuất
        </button>
      </div>
    </aside>
  );
}
