import prisma from "@/lib/prisma";
import AttributeClientRenderer from "./_components/attribute-client";

export const metadata = {
  title: "Quản lý Thuộc tính lọc | Admin",
};

export default async function AttributePage() {
  const attributes = await prisma.categoryAttribute.findMany({
    orderBy: [
      { isGlobal: "desc" }, // Global lên trước
      { categoryId: "asc" },
      { sortOrder: "asc" }
    ],
    include: {
      category: true,
      _count: {
        select: { options: true }
      }
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thuộc tính bộ lọc</h1>
          <p className="text-slate-500 mt-1">
            Quản lý các thuộc tính động áp dụng cho sản phẩm (ví dụ: Màu sắc, Kích cỡ, Vật liệu...)
          </p>
        </div>
      </div>

      <AttributeClientRenderer 
        initialAttributes={attributes} 
        categories={categories} 
      />
    </div>
  );
}
