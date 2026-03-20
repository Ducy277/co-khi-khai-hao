import prisma from "@/lib/prisma";
import BrandClientRenderer from "./_components/brand-client";

export const metadata = {
  title: "Quản lý Thương hiệu | Admin",
};

export default async function BrandPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thương hiệu</h1>
          <p className="text-slate-500 mt-1">
            Quản lý danh sách các thương hiệu phụ tùng
          </p>
        </div>
      </div>

      <BrandClientRenderer initialBrands={brands} />
    </div>
  );
}
