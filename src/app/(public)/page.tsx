import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Settings,
  CircleDot,
  Cog,
  Bolt,
  Link2,
  Gauge,
  Layers,
  type LucideIcon,
} from "lucide-react";

export const metadata = {
  title: "Cơ Khí Khải Hào - Phụ tùng chính hãng & Dịch vụ gia công",
  description:
    "Chuyên cung cấp vật tư phụ tùng cơ khí công nghiệp uy tín, vòng bi, bánh răng, dây đai. Dịch vụ gia công chi tiết máy theo bản vẽ kỹ thuật.",
};

export default async function HomePage() {
  const [latestProducts, categories, featuredProducts, heroBanner] =
    await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        take: 12,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        where: { parentId: null, isActive: true },
        take: 8,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        take: 5,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.banner.findFirst({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

  const formatPrice = (price: unknown) => {
    if (!price) return "—";
    const num = Number(price);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://cokhikhaihao.vn";

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "Organization", "AutoPartsStore"],
        "@id": `${BASE_URL}/#organization`,
        name: "Cơ Khí Khải Hào",
        url: BASE_URL,
        description:
          "Chuyên cung cấp vật tư phụ tùng cơ khí công nghiệp uy tín. Ổ bi, bánh răng, dây đai chính hãng. Dịch vụ gia công chi tiết máy theo bản vẽ.",
        telephone: "+84901234567",
        email: "admin@ckkh.vn",
      },
    ],
  };

  const categoryIconMap: Record<string, LucideIcon> = {
    "o-bi": CircleDot,
    "banh-rang": Cog,
    "bu-long-oc-vit": Bolt,
    "day-dai": Layers,
    "khop-noi": Link2,
    "xich-tai": Gauge,
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* ── HOMEPAGE LAYOUT: 20/80 ── */}
      <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Cột trái (Desktop): Sidebar cố định (20%) */}
          <div className="hidden lg:flex flex-col w-[20%] shrink-0 border border-slate-200 bg-white sticky top-24 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" /> Danh Mục
              </h2>
            </div>
            <div className="flex flex-col py-2">
              {categories.slice(0, 8).map((cat) => {
                return (
                  <Link
                    key={cat.id}
                    href={`/san-pham/${cat.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group border-b border-slate-50 last:border-0"
                  >
                    <div className="w-6 h-6 shrink-0 bg-slate-200 group-hover:bg-blue-200 transition-colors flex items-center justify-center"></div>
                    <span className="text-[13px] font-medium text-slate-700 group-hover:text-primary group-hover:font-semibold transition-all">
                      {cat.name}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
              <Link href="/san-pham" className="px-5 py-3 text-sm font-semibold text-primary hover:underline text-center mt-2 border-t border-slate-100 pt-4">
                Xem tất cả →
              </Link>
            </div>
          </div>

          {/* Cột phải: Nội dung chính (80%) */}
          <div className="flex-1 w-full flex flex-col gap-8 min-w-0">
            
            {/* Hero Banner */}
            <div className="w-full relative min-h-[200px] lg:min-h-[250px] flex items-stretch border border-slate-200 overflow-hidden bg-slate-900 group shrink-0">
            <Link href="/san-pham" className="absolute inset-0 z-20"></Link>
            {/* Background Image */}
            <Image 
              src={(heroBanner?.image && heroBanner.image.length > 0) ? heroBanner.image : "/hero_banner_machining.png"} 
              alt={heroBanner?.title || "Vật Tư Cơ Khí Khải Hào"} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />
          </div>
          
            {/* Danh mục Mobile (Hiển thị dạng cuộn ngang, ẩn trên Desktop vì đã có List) */}
            <div className="lg:hidden pb-4 shrink-0 overflow-hidden w-full">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Danh mục phổ biến</h2>
            <Link href="/san-pham" className="text-primary text-sm hover:underline font-medium">Xem tất cả</Link>
          </div>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 pb-4 -mx-4 px-4">
            {categories.slice(0, 5).map((cat) => {
              const IconComponent: LucideIcon = categoryIconMap[cat.slug] ?? Settings;
              return (
                <Link
                  key={cat.id}
                  href={`/san-pham/${cat.slug}`}
                  className="snap-start shrink-0 w-[40vw] max-w-[160px] group flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 hover:border-primary transition-all shadow-sm"
                >
                  <IconComponent className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-primary text-center line-clamp-1">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
            <Link
              href="/san-pham"
              className="snap-start shrink-0 w-[40vw] max-w-[160px] group flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 hover:bg-primary transition-all shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-blue-500 mb-1 transition-colors">
                <span className="text-slate-600 font-bold text-xl group-hover:text-white">+</span>
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-white text-center">
                Xem tất cả
              </span>
            </Link>
          </div>
            </div>

            {/* ── SẢN PHẨM NỔI BẬT (HIGHLIGHTS) ── */}
            {featuredProducts.length > 0 && (
              <div className="w-full shrink-0">
                <div className="w-full">
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-100">
              <h2 className="font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary inline-block" />
                Sản phẩm nổi bật
              </h2>
              <Link href="/san-pham" className="text-sm font-semibold text-primary hover:underline flex items-center">
                Xem thêm <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-6 md:pb-0 md:grid md:grid-cols-5 md:gap-4 -mx-4 px-4 md:mx-0 md:px-0">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/san-pham/chi-tiet/${product.slug}`}
                  className="snap-start shrink-0 w-[60vw] max-w-[240px] md:w-auto md:max-w-none group flex flex-col bg-white border border-slate-200 relative hover:border-primary hover:shadow-lg transition-all"
                >
                  <div className="absolute top-2 left-2 bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-0.5 z-10 uppercase tracking-wide">
                    Tiêu điểm
                  </div>
                  <div className="h-[150px] w-full relative flex items-center justify-center p-3 border-b border-slate-100 bg-white">
                    {product.images[0] ? (
                      <div className="relative w-[100px] h-[100px]">
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                        />
                      </div>
                    ) : (
                      <Settings className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1 bg-white">
                    <p className="text-[11px] text-slate-500 tracking-wide mb-1 line-clamp-1 uppercase">
                      {product.category.name}
                    </p>
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary line-clamp-2 leading-relaxed mb-3">
                      {product.name}
                    </h3>
                    <div className="mt-auto">
                      {product.priceOnRequest ? (
                        <span className="text-red-600 text-sm font-semibold">Liên hệ báo giá</span>
                      ) : (
                        <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CATALOG: SẢN PHẨM MỚI (DATA GRID) ── */}
      <div className="w-full shrink-0 border-t border-slate-200 pt-8 mb-8">
        <div className="w-full">
          <div className="flex flex-col mb-8 text-center items-center">
            <h2 className="font-bold text-3xl text-slate-900 tracking-tight mb-2">
              Sản phẩm mới cập nhật
            </h2>
            <p className="text-sm text-slate-500">Khám phá các vật tư và linh kiện vừa được bổ sung vào hệ thống</p>
          </div>

          <div className="border border-slate-200 bg-white shadow-sm">
            {latestProducts.length === 0 ? (
              <div className="text-center py-16">
                <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-spin-slow" />
                <p className="text-slate-500 text-sm">Chưa có dữ liệu sản phẩm mới.</p>
              </div>
            ) : (
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 lg:grid-cols-6 md:divide-y-0 md:divide-x divide-slate-100 pb-6 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 gap-3 md:gap-0">
                {latestProducts.map((product, idx) => (
                  <Link
                    key={product.id}
                    href={`/san-pham/chi-tiet/${product.slug}`}
                    className={`snap-start shrink-0 w-[45vw] max-w-[200px] md:w-auto md:max-w-none group flex flex-col bg-white hover:bg-slate-50 transition-colors relative border border-slate-200 md:border-0 md:border-b-0 ${idx >= 6 ? 'lg:border-t lg:border-slate-100' : ''} ${idx >= 4 ? 'md:border-t md:border-slate-100' : ''}`}
                  >
                    <div className="h-[150px] w-full bg-white relative flex items-center justify-center border-b border-slate-100 p-3">
                      {product.images[0] ? (
                        <div className="relative w-[100px] h-[100px]">
                          <Image
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.name}
                            fill
                            className="object-contain group-hover:-translate-y-1 transition-transform duration-300 mix-blend-multiply"
                          />
                        </div>
                      ) : (
                        <Settings className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div className="p-4 flex flex-col h-full justify-between">
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-medium mb-1">
                          {product.category.name}
                        </div>
                        <h3 className="text-xs font-semibold text-slate-800 group-hover:text-primary leading-snug line-clamp-2">
                          {product.name}
                        </h3>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 text-left">
                        {product.priceOnRequest ? (
                          <span className="text-xs font-semibold text-red-600 block hover:underline">Liên hệ tư vấn →</span>
                        ) : (
                          <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="text-center mt-10">
            <Link href="/san-pham">
              <button className="bg-white border border-slate-300 text-slate-700 font-semibold text-sm px-10 py-3 hover:bg-slate-50 hover:text-primary transition-colors shadow-sm">
                Xem Thêm Sản Phẩm
              </button>
            </Link>
          </div>
          </div>
        </div>
      </div>

    </div>
    </div>
  );
}
