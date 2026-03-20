import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <p className="text-slate-500 mb-8">
        Chào mừng <strong>{session.user.name || session.user.email}</strong> 👋
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Sản phẩm", href: "/admin/san-pham", desc: "Quản lý sản phẩm", icon: "📦" },
          { label: "Danh mục", href: "/admin/danh-muc", desc: "Quản lý danh mục", icon: "🗂️" },
          { label: "Thuộc tính", href: "/admin/thuoc-tinh", desc: "Quản lý bộ lọc", icon: "🔧" },
          { label: "Báo giá", href: "/admin/bao-gia", desc: "Yêu cầu báo giá", icon: "📋" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-slate-800">{item.label}</h3>
            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
