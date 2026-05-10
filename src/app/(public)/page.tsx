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
  ShieldCheck,
  Truck,
  Award,
  Headphones,
  Phone,
  MessageCircle,
  ShoppingCart,
  CheckCircle,
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

  const whyUsItems = [
    {
      icon: ShieldCheck,
      title: "Hàng chính hãng",
      desc: "100% xuất xứ rõ ràng, có CO/CQ đầy đủ, cam kết chất lượng từ nhà máy.",
    },
    {
      icon: Truck,
      title: "Giao hàng toàn quốc",
      desc: "Đóng gói kỹ, giao nhanh trong 24–48h nội thành và 2–5 ngày tỉnh thành khác.",
    },
    {
      icon: Award,
      title: "Kinh nghiệm 10+ năm",
      desc: "Đội ngũ kỹ thuật chuyên sâu, tư vấn lựa chọn đúng vật tư theo từng ứng dụng.",
    },
    {
      icon: Headphones,
      title: "Hỗ trợ sau bán hàng",
      desc: "Bảo hành rõ ràng, hỗ trợ kỹ thuật miễn phí trong suốt quá trình sử dụng.",
    },
  ];

  const phone = process.env.NEXT_PUBLIC_PHONE || "0901234567";
  const zalo = process.env.NEXT_PUBLIC_ZALO || "0901234567";
  const address = process.env.NEXT_PUBLIC_ADDRESS || "TP. Hồ Chí Minh";

  const partnerBrands = ["SKF", "NSK", "BANDO", "OPTIBELT", "KOYO", "TIMKEN", "FAG", "THK", "MITSUBOSHI"];

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>

      {/* ── HOMEPAGE LAYOUT: 20/80 ── */}
      <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Cột trái (Desktop): Sidebar cố định (20%) */}
          <div className="hidden lg:flex flex-col w-[20%] shrink-0 border border-slate-200 bg-white sticky top-24 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between rounded-t-xl">
              <h2 className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 text-sm">
                <Settings className="w-4 h-4 text-primary" /> Danh Mục
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
                    <div className="w-6 h-6 shrink-0 bg-slate-100 group-hover:bg-blue-200 transition-colors flex items-center justify-center rounded-full"></div>
                    <span className="text-[13px] font-medium text-slate-700 group-hover:text-primary group-hover:font-semibold transition-all">
                      {cat.name}
                    </span>
                    <ArrowRight className="w-3 h-3 ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
              <Link href="/san-pham" className="px-5 py-3 text-sm font-semibold text-primary hover:underline text-center mt-2 border-t border-slate-100 pt-4">
                Xem tất cả →
              </Link>
            </div>
          </div>

          {/* Cột phải: Nội dung chính (80%) */}
          <div className="flex-1 w-full flex flex-col gap-10 min-w-0">
            
            {/* Hero Banner */}
            <div className="w-full relative min-h-[220px] lg:min-h-[300px] flex items-stretch border border-slate-200 overflow-hidden bg-slate-900 group shrink-0 rounded-2xl shadow-sm">
              <Link href="/san-pham" className="absolute inset-0 z-20"></Link>
              {/* Background Image */}
              <Image 
                src={(heroBanner?.image && heroBanner.image.length > 0) ? heroBanner.image : "/hero_banner_machining.png"} 
                alt={heroBanner?.title || "Vật Tư Cơ Khí Khải Hào"} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-0 z-10 flex flex-col justify-center p-8 md:p-12 pointer-events-none w-full md:w-2/3">
                <span className="text-blue-400 font-bold tracking-widest text-xs uppercase mb-2">Cơ Khí Khải Hào</span>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  Giải Pháp <span className="text-primary">Vật Tư</span> & <br/>Gia Công Toàn Diện
                </h1>
                <p className="text-slate-300 text-sm md:text-base mb-6 max-w-md hidden md:block">
                  Cung cấp linh kiện cơ khí chính hãng và dịch vụ gia công CNC chính xác cao theo bản vẽ kỹ thuật.
                </p>
                <div className="flex items-center gap-3 pointer-events-auto">
                  <Link href="/san-pham" className="bg-primary hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors shadow-lg shadow-primary/30">
                    Khám Phá Ngay
                  </Link>
                  <Link href="/bao-gia" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors">
                    Nhận Báo Giá
                  </Link>
                </div>
              </div>
            </div>

            {/* ── BRANDS MARQUEE ── */}
            <div className="w-full shrink-0 border border-slate-100 bg-white rounded-xl py-5 overflow-hidden flex items-center relative shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>
              <div className="flex w-max animate-marquee hover:[animation-play-state:paused] items-center">
                {/* Đúp đôi danh sách để tạo hiệu ứng vòng lặp vô tận */}
                {[1, 2].map((group) => (
                  <div key={group} className="flex items-center justify-around w-max px-10 gap-20">
                    {partnerBrands.map((brand) => (
                      <div key={`${group}-${brand}`} className="text-2xl md:text-3xl font-black text-slate-300 uppercase tracking-widest hover:text-primary transition-colors cursor-default grayscale hover:grayscale-0 select-none">
                        {brand}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          
            {/* Danh mục Mobile */}
            <div className="lg:hidden shrink-0 overflow-hidden w-full">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Danh mục phổ biến</h2>
                <Link href="/san-pham" className="text-primary text-sm hover:underline font-medium">Xem tất cả</Link>
              </div>
              
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 pb-4 -mx-4 px-4">
                {categories.slice(0, 5).map((cat) => {
                  const IconComponent: LucideIcon = categoryIconMap[cat.slug] ?? Settings;
                  return (
                    <Link
                      key={cat.id}
                      href={`/san-pham/${cat.slug}`}
                      className="snap-start shrink-0 w-[40vw] max-w-[160px] group flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary transition-all shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <IconComponent className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-primary text-center line-clamp-1">
                        {cat.name}
                      </span>
                    </Link>
                  );
                })}
                <Link
                  href="/san-pham"
                  className="snap-start shrink-0 w-[40vw] max-w-[160px] group flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-primary transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-white/20 mb-1 transition-colors">
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
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                  <h2 className="font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-primary inline-block rounded-full" />
                    Sản phẩm nổi bật
                  </h2>
                  <Link href="/san-pham" className="text-sm font-semibold text-primary hover:underline flex items-center bg-blue-50 px-3 py-1.5 rounded-lg">
                    Xem thêm <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-6 md:pb-0 md:grid md:grid-cols-5 md:gap-4 -mx-4 px-4 md:mx-0 md:px-0">
                  {featuredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/san-pham/chi-tiet/${product.slug}`}
                      className="snap-start shrink-0 w-[65vw] max-w-[240px] md:w-auto md:max-w-none group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-300 relative"
                    >
                      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wide">Tiêu điểm</span>
                      </div>
                      
                      <div className="h-[180px] w-full relative flex items-center justify-center p-4 border-b border-slate-50 bg-slate-50 overflow-hidden">
                        <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                          <div className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" /> Xem chi tiết
                          </div>
                        </div>
                        
                        {product.images[0] ? (
                          <div className="relative w-[120px] h-[120px]">
                            <Image
                              src={product.images[0].url}
                              alt={product.images[0].alt || product.name}
                              fill
                              className="object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                            />
                          </div>
                        ) : (
                          <Settings className="w-12 h-12 text-slate-300" />
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1 bg-white">
                        <p className="text-[11px] text-slate-400 tracking-wide mb-1 line-clamp-1 uppercase font-medium">
                          {product.category.name}
                        </p>
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary line-clamp-2 leading-relaxed mb-3">
                          {product.name}
                        </h3>
                        <div className="mt-auto pt-3 border-t border-slate-50">
                          {product.priceOnRequest ? (
                            <span className="text-red-600 text-sm font-semibold block">Liên hệ báo giá</span>
                          ) : (
                            <span className="text-lg font-bold text-primary block">{formatPrice(product.price)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── DỊCH VỤ GIA CÔNG CƠ KHÍ ── */}
            <div className="w-full shrink-0 my-4">
              <div className="bg-slate-900 rounded-2xl overflow-hidden relative group border border-slate-800">
                <div className="absolute inset-0 opacity-20 bg-[url('/hero_banner_machining.png')] bg-cover bg-center mix-blend-overlay transition-transform duration-1000 group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/50"></div>
                
                <div className="relative p-8 md:p-10 lg:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                  <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-blue-300 border border-primary/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                      <Cog className="w-4 h-4 animate-spin-slow" />
                      Dịch vụ gia công CNC
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                      Gia Công Chi Tiết Máy <br className="hidden lg:block"/> Theo Bản Vẽ Kỹ Thuật
                    </h2>
                    <p className="text-slate-300 text-sm md:text-base mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                      Ngoài cung cấp vật tư tiêu chuẩn, Cơ Khí Khải Hào mang đến giải pháp gia công cơ khí chính xác. Đội ngũ kỹ sư giàu kinh nghiệm, đáp ứng mọi yêu cầu kỹ thuật khắt khe nhất.
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-slate-300 text-sm max-w-2xl mx-auto lg:mx-0 text-left">
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary shrink-0" /> Tiện, phay, bào, mài CNC chính xác</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary shrink-0" /> Xử lý nhiệt, xi mạ bề mặt kim loại</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary shrink-0" /> Chế tạo bánh răng, trục băm, nhông</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary shrink-0" /> Lên bản vẽ 2D/3D theo mẫu thực tế</li>
                    </ul>
                    <Link href="/bao-gia" className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-6 py-3.5 rounded-lg transition-colors shadow-lg shadow-primary/25">
                      Gửi Bản Vẽ Báo Giá Ngay
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                  
                  <div className="w-full lg:w-4/12 grid grid-cols-2 gap-4 shrink-0">
                    <div className="aspect-square bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group/box hover:border-primary/50 transition-colors">
                      <Settings className="w-12 h-12 text-slate-400 group-hover/box:text-primary group-hover/box:scale-110 transition-all duration-500 mb-3" />
                      <span className="text-white font-semibold text-sm">Phay CNC</span>
                    </div>
                    <div className="aspect-square bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group/box hover:border-primary/50 transition-colors mt-8">
                      <CircleDot className="w-12 h-12 text-slate-400 group-hover/box:text-primary group-hover/box:scale-110 transition-all duration-500 mb-3" />
                      <span className="text-white font-semibold text-sm">Tiện Cơ Xác</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── DANH MỤC DẠNG GRID ── */}
            {categories.length > 0 && (
              <div className="w-full shrink-0">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                  <h2 className="font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-primary inline-block rounded-full" />
                    Danh mục sản phẩm
                  </h2>
                  <Link href="/san-pham" className="text-sm font-semibold text-primary hover:underline flex items-center bg-blue-50 px-3 py-1.5 rounded-lg">
                    Tất cả danh mục <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.slice(0, 8).map((cat) => {
                    const IconComponent: LucideIcon = categoryIconMap[cat.slug] ?? Settings;
                    return (
                      <Link
                        key={cat.id}
                        href={`/san-pham/${cat.slug}`}
                        className="group bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-primary hover:shadow-md transition-all duration-300"
                      >
                        <div className="w-12 h-12 bg-slate-50 rounded-lg group-hover:bg-primary flex items-center justify-center shrink-0 transition-colors">
                          <IconComponent className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {cat.name}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── CATALOG: SẢN PHẨM MỚI ── */}
            <div className="w-full shrink-0">
              <div className="flex flex-col mb-6 items-center lg:items-start text-center lg:text-left">
                <h2 className="font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-blue-500 inline-block rounded-full hidden lg:block" />
                  Sản phẩm mới cập nhật
                </h2>
                <p className="text-sm text-slate-500 mt-1 lg:ml-5">Khám phá các vật tư và linh kiện vừa được bổ sung vào hệ thống</p>
              </div>

              {latestProducts.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
                  <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-spin-slow" />
                  <p className="text-slate-500 text-sm">Chưa có dữ liệu sản phẩm mới.</p>
                </div>
              ) : (
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 pb-6 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 gap-4">
                  {latestProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/san-pham/chi-tiet/${product.slug}`}
                      className="snap-start shrink-0 w-[55vw] max-w-[200px] md:w-auto md:max-w-none group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-300 relative"
                    >
                      <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                        <span className="bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">Mới</span>
                      </div>
                      
                      <div className="h-[160px] w-full bg-slate-50 relative flex items-center justify-center border-b border-slate-50 p-4 overflow-hidden">
                        <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                          <div className="bg-primary text-white text-xs font-bold w-10 h-10 rounded-full flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                            <ShoppingCart className="w-4 h-4" />
                          </div>
                        </div>
                        
                        {product.images[0] ? (
                          <div className="relative w-[100px] h-[100px]">
                            <Image
                              src={product.images[0].url}
                              alt={product.images[0].alt || product.name}
                              fill
                              className="object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                            />
                          </div>
                        ) : (
                          <Settings className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="p-4 flex flex-col h-full justify-between bg-white">
                        <div>
                          <div className="text-[10px] uppercase text-slate-400 font-medium mb-1 line-clamp-1">
                            {product.category.name}
                          </div>
                          <h3 className="text-xs font-semibold text-slate-800 group-hover:text-primary leading-snug line-clamp-2">
                            {product.name}
                          </h3>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-50 text-left">
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

              <div className="text-center mt-10">
                <Link href="/san-pham">
                  <button className="bg-white border border-slate-300 text-slate-700 font-semibold text-sm px-8 py-3 rounded-lg hover:bg-slate-50 hover:text-primary hover:border-primary transition-colors shadow-sm">
                    Xem Tất Cả Sản Phẩm
                  </button>
                </Link>
              </div>
            </div>
            
            {/* ── VÌ SAO CHỌN CHÚNG TÔI ── */}
            <div className="w-full shrink-0 mt-4">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <h2 className="font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-primary inline-block rounded-full" />
                  Tại sao chọn Cơ Khí Khải Hào?
                </h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {whyUsItems.map((item) => (
                  <div key={item.title} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 hover:border-primary hover:shadow-lg transition-all duration-300 group">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg group-hover:bg-primary flex items-center justify-center transition-colors shrink-0">
                      <item.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm mb-1">{item.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CTA BANNER LIÊN HỆ ── */}
            <div className="w-full shrink-0 mb-8 mt-4">
              <div className="bg-[#1e3a5f] p-8 md:p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary opacity-20 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>
                
                <div className="text-white text-center md:text-left relative z-10">
                  <h2 className="text-xl md:text-3xl font-bold mb-3">Cần tư vấn hoặc báo giá nhanh?</h2>
                  <p className="text-blue-100 text-sm md:text-base mb-1">
                    Đội ngũ kỹ thuật của chúng tôi sẵn sàng hỗ trợ bạn trong giờ hành chính.
                  </p>
                  <p className="text-blue-300 text-xs flex items-center gap-2 justify-center md:justify-start">
                    <Settings className="w-3 h-3 animate-spin-slow" /> {address}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10">
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center justify-center gap-2 bg-white text-[#1e3a5f] font-bold px-6 py-3.5 rounded-lg text-sm hover:bg-blue-50 hover:shadow-lg transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    {phone}
                  </a>
                  <a
                    href={`https://zalo.me/${zalo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-blue-500 text-white font-bold px-6 py-3.5 rounded-lg text-sm hover:bg-blue-400 hover:shadow-lg transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat Zalo
                  </a>
                </div>
              </div>
            </div>

          </div>
      </div>
    </div>
  );
}
