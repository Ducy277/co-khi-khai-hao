import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductForm from "../../_components/product-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Cập nhật sản phẩm | Admin",
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const productId = parseInt(p.id, 10);
  
  if (isNaN(productId)) return notFound();

  const [product, categories, brands, attributes] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          orderBy: { sortOrder: "asc" }
        },
        attributeValues: true
      }
    }),
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

  if (!product) return notFound();

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/admin/san-pham" className="text-blue-600 hover:underline flex items-center text-sm w-fit">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Quay lại danh sách
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Cập nhật sản phẩm</h1>
        <p className="text-slate-500 mt-1">
          Chỉnh sửa thông tin, hình ảnh và thuộc tính của sản phẩm: <span className="font-semibold">{product.name}</span>
        </p>
      </div>

      <ProductForm 
        initialData={product}
        categories={categories} 
        brands={brands} 
        attributes={attributes} 
      />
    </div>
  );
}
