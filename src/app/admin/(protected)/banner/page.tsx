import prisma from "@/lib/prisma";
import BannerClientRenderer from "./_components/banner-client";

export const metadata = {
  title: "Quản lý Banner | Admin",
};

export default async function BannerPage() {
  const [banners, categories] = await Promise.all([
    prisma.banner.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.category.findMany({
      select: { name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Banner</h1>
          <p className="text-slate-500 mt-1">
            Quản lý nội dung banner hiển thị ở trang chủ.
          </p>
        </div>
      </div>

      <BannerClientRenderer initialBanners={banners} categories={categories} />
    </div>
  );
}
