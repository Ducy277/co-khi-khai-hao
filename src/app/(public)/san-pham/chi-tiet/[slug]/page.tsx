import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Phone, MessageSquare, CheckCircle2, FileText, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import ProductGallery from "@/components/product/product-gallery";
import AddToQuoteButton from "@/components/quote/add-to-quote-button";

type Props = {
  params: Promise<{ slug: string }>;
};

// SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const product = await prisma.product.findUnique({
    where: { slug: p.slug },
    include: { category: true, brand: true, images: true }
  });

  if (!product) {
    return { title: 'Sản phẩm | Cơ Khí Khải Hào' };
  }

  return {
    title: `${product.name} | ${product.brand?.name || "Giá Mới"} | Phụ Tùng Cơ Khí`,
    description: product.description ? product.description.substring(0, 160) : `Sản phẩm ${product.name} chính hãng chất lượng cao. Mã SKU: ${product.sku}. Liên hệ Báo giá tốt nhất.`,
    alternates: {
      canonical: `/san-pham/chi-tiet/${product.slug}`
    }
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const p = await params;
  
  // Fetch SP + Quan hệ Category, Brand, Hình ảnh, và Tất cả Specifications từ EAV (bảng ProductAttributeValue)
  const product = await prisma.product.findUnique({
    where: { slug: p.slug },
    include: {
      category: {
        include: { parent: true }
      },
      brand: true,
      images: {
        orderBy: { sortOrder: "asc" }
      },
      attributeValues: {
        include: {
          attribute: true
        }
      }
    }
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const formatPrice = (price: unknown) => {
    if (!price) return "—";
    const num = Number(price);
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Group attributes for Specs Table
  const specifications = product.attributeValues
    .map(av => ({
      name: av.attribute.name,
      value: av.value,
      sortOrder: av.attribute.sortOrder
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Lấy dữ liệu sản phẩm tương tự (cùng danh mục)
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true
    },
    take: 4,
    include: {
      images: { where: { isPrimary: true }, take: 1 }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-slate-500 flex-wrap">
            <Link href="/" className="hover:text-blue-600 transition-colors whitespace-nowrap">Trang chủ</Link>
            <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 text-slate-300 flex-shrink-0" />
            <Link href="/san-pham" className="hover:text-blue-600 transition-colors whitespace-nowrap">Sản phẩm</Link>
            
            {product.category.parent && (
              <>
                 <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 text-slate-300 flex-shrink-0" />
                 <Link href={`/san-pham/${product.category.parent.slug}`} className="hover:text-blue-600 transition-colors whitespace-nowrap">
                   {product.category.parent.name}
                 </Link>
              </>
            )}

            <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 text-slate-300 flex-shrink-0" />
            <Link href={`/san-pham/${product.category.slug}`} className="hover:text-blue-600 transition-colors whitespace-nowrap hidden sm:inline-block">
              {product.category.name}
            </Link>

            <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 text-slate-300 flex-shrink-0 hidden sm:inline-block" />
            <span className="text-slate-800 font-medium whitespace-nowrap hidden sm:inline-block w-48 truncate" title={product.name}>{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12 flex flex-col lg:flex-row">
          {/* Cột trái: Gallery Dạng Client Slide */}
          <div className="w-full lg:w-1/2 p-6 lg:border-r border-slate-200 bg-slate-50/50">
             <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Cột phải: Thông tin SP (Header, Giá, Specs table, Action) */}
          <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-blue-600 font-medium text-sm px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                {product.category.name}
              </span>
              <span className="text-slate-500 font-mono text-sm bg-slate-100 px-2 py-1 rounded">SKU: {product.sku}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-6 mb-8 text-sm text-slate-600">
              <div className="flex items-center">
                <span className="mr-2">Thương hiệu:</span>
                <span className="font-bold text-slate-800">{product.brand?.name || "Đang cập nhật"}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" />
                <span className="text-emerald-700 font-medium">Hàng chính hãng</span>
              </div>
            </div>

            {/* Bảng Giá */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
              {product.priceOnRequest ? (
                <div className="flex flex-col">
                  <span className="text-slate-500 text-sm mb-1 uppercase tracking-wider font-semibold">Tình trạng Giá</span>
                  <div className="text-3xl font-extrabold text-red-600">Liên hệ báo giá</div>
                  <p className="text-slate-500 text-sm mt-2">Vui lòng liên hệ trực tiếp cho tư vấn viên để lấy giá chiết khấu ưu đãi nhất.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-slate-500 text-sm mb-1 uppercase tracking-wider font-semibold">Giá bán lẻ (Cơ bản)</span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-blue-700">{formatPrice(product.price)}</div>
                </div>
              )}
            </div>

            {/* Bảng thông số kỹ thuật EAV Loop rút gọn (Chỉ top 5 specs, còn lại gộp vào Chi tiết Data Sheet) */}
            {specifications.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  Thông số Kỹ Thuật Chính
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <tbody>
                      {specifications.slice(0, 5).map((spec, idx) => (
                        <tr key={idx} className="border-b border-slate-100 last:border-b-0">
                          <th className="py-2.5 px-4 bg-slate-50 text-slate-600 font-medium w-48">{spec.name}</th>
                          <td className="py-2.5 px-4 text-slate-800 font-semibold">{spec.value || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {specifications.length > 5 && (
                  <p className="text-blue-600 text-sm mt-2 cursor-pointer hover:underline">
                    Xem toàn bộ thông số kỹ thuật ở bên dưới ↓
                  </p>
                )}
              </div>
            )}

            {/* Nút hành động */}
            <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <AddToQuoteButton
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  sku: product.sku,
                  price: product.price ? Number(product.price) : null,
                  priceOnRequest: product.priceOnRequest,
                  imageUrl: product.images[0]?.url,
                }}
              />
              <a href="https://zalo.me/0901234567" target="_blank" rel="noopener noreferrer" className="col-span-1 sm:col-span-1 lg:col-span-1 block w-full">
                <Button size="lg" className="bg-[#0068FF] hover:bg-blue-600 text-white w-full h-14 font-bold border border-[#0068FF] shadow-lg">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Chat Zalo
                </Button>
              </a>
              <a href="tel:0901234567" className="col-span-1 sm:col-span-2 lg:col-span-1 block w-full">
                <Button size="lg" variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 w-full h-14 font-bold border-2">
                  <Phone className="w-5 h-5 mr-2" />
                  Gọi 090...
                </Button>
              </a>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-xs text-slate-500 flex items-center justify-center">
                <Award className="w-4 h-4 mr-1 text-slate-400" /> Cam kết bảo hành 12 tháng. Miễn phí vận chuyển nội thành.
              </p>
            </div>
          </div>
        </div>

        {/* Section Bảng Spec Đầy đủ vs Mô Tả dài */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
               <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Đặc Điểm & Mô Tả Dữ Liệu</h2>
               
               {product.description ? (
                 <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-line mb-10">
                   {product.description}
                 </div>
               ) : (
                 <p className="text-slate-500 italic mb-10">Nội dung mô tả cho sản phẩm {product.name} đang được chúng tôi cập nhật...</p>
               )}

               {/* Bảng Dữ Liệu Full EAV */}
               {specifications.length > 0 && (
                 <>
                   <h3 className="text-xl font-bold text-slate-900 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 uppercase tracking-widest text-sm text-center">Bảng Thông Số Điện Kỹ Thuật (Data Sheet)</h3>
                   <div className="border border-slate-200 rounded-lg overflow-hidden">
                     <table className="w-full text-left">
                       <tbody>
                         {specifications.map((spec, idx) => (
                           <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                             <th className="py-3 px-6 bg-slate-50/50 text-slate-600 font-medium w-1/3 border-r border-slate-100">{spec.name}</th>
                             <td className="py-3 px-6 text-slate-800">{spec.value || "—"}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </>
               )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-xl text-white p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Bạn Cần Trợ Giúp?</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Chuyên viên của Cơ Khí Khải Hào luôn sẵn sàng hỗ trợ bạn chọn đúng mã sản phẩm và đo lường kỹ thuật trước khi đặt mua.
              </p>
              <a href="tel:0901234567" className="flex items-center gap-3 bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-blue-200">Hotline 24/7</div>
                  <div className="font-bold text-lg">090 123 4567</div>
                </div>
              </a>
               <a href="mailto:admin@ckkh.vn" className="flex items-center gap-3 bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-blue-200">Gửi Mail báo giá bản vẽ</div>
                  <div className="font-bold">admin@ckkh.vn</div>
                </div>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
