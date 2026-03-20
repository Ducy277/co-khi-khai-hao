import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Settings, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Tất cả sản phẩm | Cơ Khí Khải Hào",
  description: "Khám phá danh mục phụ tùng cơ khí phong phú: ổ bi, nhông xích, dây đai, khớp nối. Hàng chính hãng, giá tốt nhất.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const p = await searchParams;
  const page = parseInt(p.page || "1", 10);
  const q = p.q || "";
  const limit = 16;
  const skip = (page - 1) * limit;

  // Xây dựng câu truy vấn
  const whereClause: any = { isActive: true };
  if (q) {
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        },
        category: true
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.product.count({ where: whereClause }),
    prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }]
    })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const formatPrice = (price: unknown) => {
    if (!price) return "—";
    const num = Number(price);
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-slate-500 mb-2">
            <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
            <span className="text-slate-800 font-medium">Sản phẩm</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {q ? `Kết quả tìm kiếm: "${q}"` : "Tất cả sản phẩm"}
          </h1>
          <p className="text-slate-500 mt-2">Hiển thị {products.length} trên tổng {totalCount} sản phẩm.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Danh mục tạm thời (Bộ lọc nâng cao sẽ làm ở tuần 2) */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                <Filter className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-slate-800 text-lg">Danh mục</h2>
              </div>
              
              <ul className="space-y-1">
                <li>
                  <Link href="/san-pham" className="block px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium text-sm">
                    Tất cả sản phẩm
                  </Link>
                </li>
                {categories.filter(c => !c.parentId).map(category => (
                  <li key={category.id}>
                    <Link href={`/san-pham/${category.slug}`} className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 font-medium text-sm transition-colors">
                      {category.name}
                    </Link>
                    {/* Hiển thị con */}
                    {categories.filter(c => c.parentId === category.id).length > 0 && (
                      <ul className="pl-4 mt-1 space-y-1 border-l-2 border-slate-100 ml-4">
                        {categories.filter(c => c.parentId === category.id).map(child => (
                           <li key={child.id}>
                             <Link href={`/san-pham/${child.slug}`} className="block px-3 py-1.5 rounded-md text-slate-500 hover:text-blue-600 text-sm transition-colors">
                               {child.name}
                             </Link>
                           </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
                <Settings className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-slate-500">Thử tìm kiếm với từ khóa khác hoặc duyệt qua danh mục của chúng tôi.</p>
                <Link href="/san-pham">
                   <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Xóa bộ lọc</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/san-pham/chi-tiet/${product.slug}`} className="group flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all hover:border-blue-300">
                    <div className="aspect-square bg-slate-100 relative overflow-hidden p-2">
                       <div className="w-full h-full relative rounded-lg overflow-hidden bg-white">
                        {product.images[0] ? (
                          <Image 
                            src={product.images[0].url} 
                            alt={product.images[0].alt || product.name}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-500 p-2"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-200 bg-slate-50">
                            <Settings className="w-10 h-10" />
                          </div>
                        )}
                       </div>
                      {product.priceOnRequest && (
                        <div className="absolute top-2 right-2 bg-slate-800 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded shadow-sm">
                          BÁO GIÁ
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col flex-grow border-t border-slate-100">
                      <div className="text-[10px] sm:text-xs text-slate-500 mb-1.5 flex items-center justify-between">
                        <span className="truncate pr-2">{product.category.name}</span>
                        <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-400">{product.sku}</span>
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm sm:text-base leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 flex-grow">
                        {product.name}
                      </h3>
                      <div className="mt-auto">
                        {product.priceOnRequest ? (
                          <p className="text-red-600 font-bold text-sm sm:text-base">Liên hệ Zalo</p>
                        ) : (
                          <p className="text-blue-700 font-bold text-sm sm:text-base">{formatPrice(product.price)}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination Box */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === page;
                    return (
                      <Link 
                        key={pageNum} 
                        href={`/san-pham?page=${pageNum}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${
                          isActive 
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
