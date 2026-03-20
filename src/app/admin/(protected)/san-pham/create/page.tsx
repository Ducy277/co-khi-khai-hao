import prisma from "@/lib/prisma";
import ProductForm from "../_components/product-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Thêm sản phẩm mới | Admin",
};

export default async function CreateProductPage() {
  const [categories, brands, attributes] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.brand.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.categoryAttribute.findMany({
      where: { isActive: true },
      orderBy: [{ isGlobal: "desc" }, { sortOrder: "asc" }],
      include: {
        options: {
          orderBy: { sortOrder: "asc" }
        }
      }
    })
  ]);

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/admin/san-pham" className="text-blue-600 hover:underline flex items-center text-sm w-fit">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Quay lại danh sách
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Thêm sản phẩm mới</h1>
        <p className="text-slate-500 mt-1">
          Điền thông tin chi tiết để đăng tải sản phẩm lên website
        </p>
      </div>

      <ProductForm 
        categories={categories} 
        brands={brands} 
        attributes={attributes} 
      />
    </div>
  );
}
