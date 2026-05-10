import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Phone, MessageSquare, CheckCircle2, FileText, Award, Settings } from "lucide-react";
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

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cokhikhaihao.vn";

  // JSON-LD Structured Data (Product + BreadcrumbList)
  const productJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        sku: product.sku,
        description: product.description || `${product.name} - Phụ tùng cơ khí chính hãng`,
        image: product.images[0]?.url
          ? `${BASE_URL}${product.images[0].url}`
          : undefined,
        brand: product.brand
          ? { "@type": "Brand", name: product.brand.name }
          : undefined,
        offers: {
          "@type": "Offer",
          priceCurrency: "VND",
          ...(product.priceOnRequest
            ? { availability: "https://schema.org/InStock", priceSpecification: { "@type": "PriceSpecification", priceCurrency: "VND" } }
            : {
                price: product.price ? Number(product.price) : 0,
                availability: "https://schema.org/InStock",
              }),
          seller: { "@type": "Organization", name: "Cơ Khí Khải Hào" },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Sản phẩm", item: `${BASE_URL}/san-pham` },
          ...(product.category.parent
            ? [{ "@type": "ListItem", position: 3, name: product.category.parent.name, item: `${BASE_URL}/san-pham/${product.category.parent.slug}` },
               { "@type": "ListItem", position: 4, name: product.category.name, item: `${BASE_URL}/san-pham/${product.category.slug}` }]
            : [{ "@type": "ListItem", position: 3, name: product.category.name, item: `${BASE_URL}/san-pham/${product.category.slug}` }]),
        ],
      },
    ],
  };

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

  // Lấy các sản phẩm cùng tên nhưng khác hãng
  const sameNameProducts = await prisma.product.findMany({
    where: { name: product.name, isActive: true },
    include: { brand: true },
    orderBy: { price: "asc" }
  });

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
    <div className="bg-slate-50 min-h-screen pb-32 lg:pb-20 pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 sm:px-6 mb-6">
        <div className="bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors">TRANG CHỦ</Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link href="/san-pham" className="hover:text-primary transition-colors">SẢN PHẨM</Link>
            {product.category.parent && (
              <>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                <Link href={`/san-pham/${product.category.parent.slug}`} className="hover:text-primary transition-colors">
                  {product.category.parent.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
            <Link href={`/san-pham/${product.category.slug}`} className="hover:text-primary transition-colors hidden sm:inline text-slate-800">
              {product.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
            <span className="text-primary font-bold hidden sm:inline truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="bg-white border border-slate-200 shadow-sm mb-12 flex flex-col lg:flex-row lg:h-[500px]">

          <div className="w-full lg:w-[42%] lg:border-r border-slate-200 bg-slate-50 flex items-center justify-center p-4 shrink-0">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          <div className="w-full lg:w-[58%] flex flex-col bg-white overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white flex items-center justify-between border-b border-slate-100 px-6 py-3">
              <span className="text-white font-bold text-[11px] px-3 py-1 bg-slate-800 tracking-wider">
                {product.category.name}
              </span>
              <span className="text-primary font-mono font-medium text-xs border border-primary px-2 py-1 bg-blue-50">SKU: {product.sku}</span>
            </div>

            <div className="flex flex-col flex-1 p-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-[1.2] mb-4">
                {product.name}
              </h1>

              {/* Chọn thương hiệu */}
              {sameNameProducts.length > 1 ? (
                <div className="mb-5">
                  <div className="text-xs font-semibold tracking-wide text-slate-600 mb-2 border-l-4 border-primary pl-4 flex items-center">
                    <span className="mr-2">LỰA CHỌN THƯƠNG HIỆU:</span>
                    <div className="flex items-center text-green-700 ml-auto">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      <span>CHÍNH HÃNG</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sameNameProducts.map((snp) => (
                      <Link key={snp.id} href={`/san-pham/chi-tiet/${snp.slug}`} replace>
                        <div className={`px-3 py-2 border rounded-md cursor-pointer transition-all flex flex-col items-center justify-center min-w-[76px] text-sm ${
                          snp.id === product.id
                            ? 'border-primary bg-blue-50 text-primary font-bold'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                        }`}>
                          <span>{snp.brand?.name || "Không rõ"}</span>
                          {snp.priceOnRequest ? (
                            <span className={`text-[10px] mt-0.5 ${snp.id === product.id ? 'text-primary' : 'text-slate-500'}`}>Liên hệ</span>
                          ) : (
                            <span className={`text-[10px] mt-0.5 ${snp.id === product.id ? 'text-primary' : 'text-slate-500'}`}>{formatPrice(snp.price)}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-5 mb-5 text-xs font-semibold tracking-wide text-slate-600 border-l-4 border-primary pl-4">
                  <div className="flex items-center">
                    <span className="mr-2">THƯƠNG HIỆU:</span>
                    <span className="text-primary">{product.brand?.name || "ĐANG CẬP NHẬT"}</span>
                  </div>
                  <div className="flex items-center text-green-700">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    <span>CHÍNH HÃNG</span>
                  </div>
                </div>
              )}

              {/* Giá */}
              <div className="bg-slate-50 px-5 py-4 border border-slate-200 mb-5 relative">
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 tracking-wider">
                  {product.priceOnRequest ? "BÁO GIÁ" : "GIÁ BÁN"}
                </div>
                {product.priceOnRequest ? (
                  <div>
                    <div className="text-2xl font-bold text-red-600 tracking-tight">LIÊN HỆ BÁO GIÁ</div>
                    <p className="text-slate-500 text-xs mt-1">Vui lòng liên hệ để được tư vấn giá tốt nhất.</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-slate-500 text-[11px] font-semibold tracking-wider uppercase">Giá bán lẻ</span>
                    <div className="text-3xl font-bold text-primary tracking-tight mt-0.5">{formatPrice(product.price)}</div>
                  </div>
                )}
              </div>

              {/* Thông số kỹ thuật rút gọn */}
              {specifications.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center uppercase tracking-wide pb-1.5 border-b border-slate-200">
                    <FileText className="w-3.5 h-3.5 text-primary mr-1.5" strokeWidth={2} />
                    THÔNG SỐ KỸ THUẬT
                  </h3>
                  <div className="border border-slate-200">
                    <table className="w-full text-xs">
                      <tbody>
                        {specifications.slice(0, 4).map((spec, idx) => (
                          <tr key={idx} className="border-b border-slate-100 last:border-b-0">
                            <th className="py-1.5 px-3 bg-slate-50 text-slate-600 font-medium w-2/5 border-r border-slate-100">{spec.name}</th>
                            <td className="py-1.5 px-3 text-slate-900">{spec.value || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {specifications.length > 4 && (
                    <p className="text-primary text-[10px] font-bold mt-1 cursor-pointer hover:underline text-right">Xem toàn bộ ↓</p>
                  )}
                </div>
              )}

              {/* Nút hành động */}
              <div className="mt-auto grid grid-cols-3 gap-2.5">
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
                <a href={`https://zalo.me/${process.env.NEXT_PUBLIC_ZALO || "0901234567"}`} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button size="lg" className="bg-[#0068FF] hover:bg-blue-700 text-white w-full h-12 font-semibold text-xs rounded-none transition-all">
                    <MessageSquare className="w-4 h-4 mr-2" /> Zalo
                  </Button>
                </a>
                <a href={`tel:${process.env.NEXT_PUBLIC_PHONE || "0901234567"}`} className="block w-full">
                  <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 w-full h-12 font-semibold border-2 rounded-none text-xs transition-all">
                    <Phone className="w-4 h-4 mr-2" /> Hotline
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Section Bảng Spec Đầy đủ vs Mô Tả dài */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 items-start">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-white shadow-sm border border-slate-200 p-6 md:p-8">
               <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b-2 border-primary uppercase tracking-wide inline-block">Đặc điểm kỹ thuật</h2>
               
               {product.description ? (
                 <div className="prose prose-sm md:prose-base max-w-none text-slate-600 whitespace-pre-line leading-relaxed">
                   {product.description}
                 </div>
               ) : (
                 <p className="text-slate-500 text-sm">Nội dung mô tả cho sản phẩm này đang được cập nhật thêm.</p>
               )}
            </div>

            {/* Bảng Dữ Liệu Full EAV */}
            {specifications.length > 0 && (
              <div className="bg-white shadow-sm border border-slate-200 p-6 md:p-8">
                <h3 className="text-sm font-bold text-slate-800 mb-6 bg-slate-100 p-3 border border-slate-200 flex justify-between items-center w-full uppercase">
                  <span>Bảng dữ liệu kỹ thuật (Data Sheet)</span>
                </h3>
                <div className="border border-slate-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {specifications.map((spec, idx) => (
                        <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                          <th className="py-3 px-4 md:px-6 bg-slate-50 text-slate-600 font-semibold w-1/3 border-r border-slate-100">{spec.name}</th>
                          <td className="py-3 px-4 md:px-6 text-slate-900">{spec.value || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-800 border border-slate-700 shadow-md text-white p-6 sticky top-32">
              <h3 className="text-lg font-bold mb-4 text-white">Trung tâm hỗ trợ</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 border-l-2 border-primary pl-3">
                Chuyên viên của Cơ Khí Khải Hào sẵn sàng hỗ trợ đo lường, lựa chọn đúng mã sản phẩm và tư vấn kỹ thuật chuyên sâu.
              </p>
              <a href={`tel:${process.env.NEXT_PUBLIC_PHONE || "0901234567"}`} className="flex items-center gap-3 bg-slate-900 border border-slate-700 p-4 hover:border-primary transition-all mb-4 group">
                <div className="w-10 h-10 bg-primary flex items-center justify-center shrink-0 text-white">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Hotline 24/7</div>
                  <div className="font-bold text-lg group-hover:text-primary transition-colors">{process.env.NEXT_PUBLIC_PHONE || "090 123 4567"}</div>
                </div>
              </a>
               <a href={`mailto:${process.env.NEXT_PUBLIC_EMAIL || "admin@ckkh.vn"}`} className="flex items-center gap-3 bg-slate-900 border border-slate-700 p-4 hover:border-primary transition-all group">
                <div className="w-10 h-10 bg-primary flex items-center justify-center shrink-0 text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Email Gửi Bản Vẽ</div>
                  <div className="font-bold text-sm group-hover:text-primary transition-colors">{process.env.NEXT_PUBLIC_EMAIL || "admin@ckkh.vn"}</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Sản phẩm liên quan (Smaller Grid) */}
        {relatedProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary inline-block"></span>
              Sản phẩm cùng loại
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={`/san-pham/chi-tiet/${related.slug}`}
                  className="group bg-white border border-slate-200 hover:border-primary hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  <div className="aspect-square bg-slate-50 relative flex justify-center items-center border-b border-slate-100">
                    {related.images[0] ? (
                      <Image
                        src={related.images[0].url}
                        alt={related.images[0].alt || related.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                      />
                    ) : (
                      <Settings className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="p-3 bg-white flex flex-col flex-1 justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 tracking-wide mb-1 uppercase line-clamp-1">{related.sku}</p>
                      <h3 className="text-xs font-semibold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {related.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Fixed Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 z-50 flex gap-2 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex-1">
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
        </div>
        <a href={`https://zalo.me/${process.env.NEXT_PUBLIC_ZALO || "0901234567"}`} target="_blank" rel="noopener noreferrer" className="w-14 h-14 flex items-center justify-center bg-[#0068FF] text-white rounded-md shrink-0 shadow-sm border border-[#0068FF]">
          <MessageSquare className="w-6 h-6" />
        </a>
        <a href={`tel:${process.env.NEXT_PUBLIC_PHONE || "0901234567"}`} className="w-14 h-14 flex items-center justify-center border-2 border-emerald-600 text-emerald-700 bg-emerald-50 rounded-md shrink-0 shadow-sm">
          <Phone className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
}
