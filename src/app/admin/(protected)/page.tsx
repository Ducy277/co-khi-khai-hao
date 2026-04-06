import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Package, FolderOpen, Tags, ClipboardList, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  // Fetch real statistics
  const [productCount, categoryCount, brandCount, newQuoteCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.quoteRequest.count({ where: { status: "new" } }),
  ]);

  const stats = [
    { label: "Sản phẩm", value: productCount, href: "/admin/san-pham", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Danh mục", value: categoryCount, href: "/admin/danh-muc", icon: FolderOpen, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Thương hiệu", value: brandCount, href: "/admin/thuong-hieu", icon: Tags, color: "text-teal-500", bg: "bg-teal-50" },
    { label: "Báo giá mới", value: newQuoteCount, href: "/admin/bao-gia", icon: ClipboardList, color: "text-rose-500", bg: "bg-rose-50" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Tổng quan Hệ thống
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Chào mừng quản trị viên <strong className="text-slate-700">{session.user.name || session.user.email}</strong>
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block p-5 bg-white border border-slate-200 hover:border-primary hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110 ${item.bg}`} />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{item.label}</p>
                <h3 className="text-3xl font-bold text-slate-800">{item.value}</h3>
              </div>
              <div className={`p-3 rounded-none border border-slate-100 ${item.bg} ${item.color}`}>
                <item.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
            </div>
            <div className="relative z-10 mt-4 text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
              Quản lý ngay &rarr;
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
