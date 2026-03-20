import prisma from "@/lib/prisma";
import CategoryClientRenderer from "./_components/category-client";

export const metadata = {
  title: "Quản lý Danh mục | Admin",
};

export default async function CategoryPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    include: {
      parent: true,
      children: true,
      _count: {
        select: { products: true, children: true },
      },
    },
  });

  // Có thể process dữ liệu thành tree trên server nhưng ở đây để client tự xếp,
  // Hoặc chuyển tree flat danh sách dễ nhìn (Cha -> Con)
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Danh mục</h1>
          <p className="text-slate-500 mt-1">
            Quản lý và phân cấp danh mục sản phẩm (Cha - Con)
          </p>
        </div>
      </div>

      <CategoryClientRenderer initialCategories={categories} />
    </div>
  );
}
