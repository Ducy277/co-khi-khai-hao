import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Phone,
  Settings,
  CircleDot,
  Cog,
  Bolt,
  Link2,
  Gauge,
  Layers,
  Zap,
  type LucideIcon,
  MessageSquare,
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

      {/* ── HERO: 30/70 LAYOUT ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col lg:flex-row gap-6 items-stretch">
          
          {/* Cột trái (Desktop): Danh mục dạng List (30%) */}
          <div className="hidden lg:flex flex-col w-[30%] shrink-0 border border-slate-200 bg-white">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" /> Danh Mục
              </h2>
            </div>
            <div className="flex flex-col py-2">
              {categories.slice(0, 8).map((cat) => {
                const IconComponent: LucideIcon = categoryIconMap[cat.slug] ?? CircleDot;
                return (
                  <Link
                    key={cat.id}
                    href={`/san-pham/${cat.slug}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors group border-b border-slate-50 last:border-0"
                  >
                    <IconComponent className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary group-hover:font-semibold transition-all">
                      {cat.name}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
              <Link href="/san-pham" className="px-5 py-3 text-sm font-semibold text-primary hover:underline text-center mt-2 border-t border-slate-100 pt-4">
                Xem tất cả danh mục →
              </Link>
            </div>
          </div>

          {/* Cột phải: Hero Banner & Tuyên ngôn (Overlay, 70%) */}
          <div className="flex-1 w-full relative min-h-[400px] lg:min-h-[500px] flex items-stretch border border-slate-200 overflow-hidden bg-slate-900 group">
            {/* Background Image */}
            <Image 
              src={(heroBanner?.image && heroBanner.image.length > 0) ? heroBanner.image : "/hero_banner_machining.png"} 
              alt={heroBanner?.title || "Vật Tư Cơ Khí Khải Hào"} 
              fill 
              className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
              priority
            />
            
            {/* Overlay Banner Text */}
            <div className="relative z-10 flex flex-col justify-center p-8 lg:p-14 w-full md:w-3/4">
              <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm text-blue-100 font-semibold px-3 py-1.5 text-xs uppercase tracking-wider mb-6 self-start border border-blue-400/30">
                <Zap className="w-3.5 h-3.5 fill-current" /> Phân phối toàn quốc
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 text-white">
                Vật Tư Cơ Khí <br/>
                <span className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-teal-300">
                  Chính Xác
                </span>
              </h1>
              <p className="text-slate-300 text-base max-w-md mb-8 leading-relaxed font-medium">
                Nhà phân phối chính hãng các dòng sản phẩm ổ bi, bánh răng, dây đai truyền động. Hỗ trợ gia công chi tiết máy CNC theo bản vẽ tùy chỉnh với độ dung sai lý tưởng.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/san-pham">
                  <button className="bg-primary hover:bg-blue-600 text-white font-semibold text-sm px-8 py-3.5 transition-colors shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide w-full sm:w-auto">
                    Xem Sản Phẩm <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/bao-gia">
                  <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold text-sm px-8 py-3.5 transition-colors uppercase tracking-wide w-full sm:w-auto shadow-sm">
                    Gửi Bản Vẽ
                  </button>
                </Link>
              </div>
            </div>
          </div>
          
        </div>

        {/* Danh mục Mobile (Hiển thị dạng cuộn ngang, ẩn trên Desktop vì đã có List) */}
        <div className="lg:hidden container mx-auto px-4 pb-8">
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
      </section>


      {/* ── SẢN PHẨM NỔI BẬT (HIGHLIGHTS) ── */}
      {featuredProducts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
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
                  <div className="aspect-square relative flex items-center justify-center p-4 border-b border-slate-100 bg-slate-50/50">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                      />
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
        </section>
      )}

      {/* ── CATALOG: SẢN PHẨM MỚI (DATA GRID) ── */}
      <section className="py-12 mb-8 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4">
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
                    <div className="aspect-square bg-white relative flex items-center justify-center border-b border-slate-100 p-2">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          fill
                          className="object-contain p-5 group-hover:-translate-y-1 transition-transform duration-300"
                        />
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
      </section>

      {/* ── CTA: GIA CÔNG BẢN VẼ ── */}
      <section className="bg-slate-900 overflow-hidden relative border-t border-slate-800">
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto p-4">
            <div>
              <h2 className="text-white font-bold text-3xl md:text-4xl tracking-tight mb-4">
                Gia công chi tiết máy <br/> theo bản vẽ
              </h2>
              <p className="text-slate-300 text-sm max-w-md leading-relaxed border-l-2 border-primary pl-4">
                Xưởng cơ khí nội bộ ứng dụng công nghệ tiện, phay CNC hiện đại. Cam kết độ chính xác cao và bàn giao đúng tiến độ. Gửi báo giá mộc định trong vòng 2 giờ.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link href="/lien-he">
                <button className="bg-primary text-white font-semibold text-sm px-8 py-4 shadow-lg hover:bg-blue-600 transition-colors flex items-center">
                  Gửi Bản Vẽ Ngay <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </Link>
              <a href="tel:0901234567">
                <button className="bg-slate-800 text-white border border-slate-700 font-semibold text-sm px-8 py-4 hover:bg-slate-700 transition-colors flex items-center w-full justify-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Hotline Hỗ Trợ
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
