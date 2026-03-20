import prisma from "@/lib/prisma";
import ProductClientRenderer from "./_components/product-client";

export const metadata = {
  title: "Quản lý Sản phẩm | Admin",
};

export default async function ProductPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      brand: true,
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      // Nếu không có ảnh primary, lấy tạm ảnh đầu tiên
      // do Prisma không hỗ trợ fallback trong select dễ dàng, 
      // ta sẽ lấy list id và lấy thêm 1 ảnh tùy ý ở client hoặc lấy thêm relation
      _count: {
        select: { quoteItems: true }
      }
    },
  });

  // Fetch lại ảnh đầu tiên cho những SP không set isPrimary
  const productsWithFallbackImage = await Promise.all(
    products.map(async (p) => {
      let coverImage = p.images[0]?.url;
      if (!coverImage) {
        const fallback = await prisma.productImage.findFirst({
          where: { productId: p.id },
          orderBy: { sortOrder: "asc" }
        });
        coverImage = fallback?.url || "";
      }
      return {
        ...p,
        coverImage,
      };
    })
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sản phẩm</h1>
          <p className="text-slate-500 mt-1">
            Quản lý danh sách sản phẩm, giá bán, hình ảnh và thuộc tính kỹ thuật.
          </p>
        </div>
      </div>

      <ProductClientRenderer initialProducts={productsWithFallbackImage} />
    </div>
  );
}
