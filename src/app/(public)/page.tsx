import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Phone,
  Clock,
  Settings,
  ShieldCheck,
  Wrench,
  Truck,
  Tag,
  ChevronRight,
  CircleDot,
  Cog,
  Bolt,
  Link2,
  Gauge,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
        take: 16,
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
        take: 4,
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
        address: {
          "@type": "PostalAddress",
          addressCountry: "VN",
          addressLocality: "TP. Hồ Chí Minh",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            opens: "08:00",
            closes: "17:30",
          },
        ],
        priceRange: "₫₫",
        currenciesAccepted: "VND",
        paymentAccepted: "Cash, Bank Transfer",
      },
    ],
  };

  const bannerImage =
    heroBanner?.image ||
    "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  // Lucide icon map cho từng category slug
  const categoryIconMap: Record<string, LucideIcon> = {
    "o-bi": CircleDot,
    "banh-rang": Cog,
    "bu-long-oc-vit": Bolt,
    "day-dai": Layers,
    "khop-noi": Link2,
    "xich-tai": Gauge,
  };

  return (
    <div className="bg-slate-100 min-h-screen">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* ── TOP INFO BAR ── */}
      <div className="bg-slate-800 text-slate-300 text-xs py-1.5 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> T2–T7: 08:00 – 17:30
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> 090 123 4567
            </span>
          </div>
          <span>Miễn phí vận chuyển nội thành TP.HCM cho đơn từ 500.000đ</span>
        </div>
      </div>

      {/* ── HERO: COMPACT SPLIT LAYOUT ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-4 items-stretch">

            {/* Banner thu nhỏ bên trái — 40% width, chỉ show trên lg+ */}
            <div className="hidden lg:flex relative w-5/12 rounded-xl overflow-hidden min-h-[220px] bg-slate-900 shrink-0">
              <Image
                src={bannerImage}
                alt="Cơ Khí Khải Hào"
                fill
                className="object-cover opacity-50"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/30" />
              <div className="relative z-10 p-6 flex flex-col justify-center">
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-2">
                  Phụ tùng cơ khí chính hãng
                </p>
                <h1 className="text-white text-xl font-bold leading-tight mb-3">
                  Cơ Khí Khải Hào
                  <br />
                  <span className="text-blue-300">10+ năm kinh nghiệm</span>
                </h1>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                  Ổ bi, bánh răng, bu lông chính hãng. Gia công CNC theo bản vẽ.
                </p>
                <div className="flex gap-2">
                  <Link href="/san-pham">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs h-8">
                      Xem sản phẩm <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/lien-he">
                    <Button size="sm" variant="outline" className="border-slate-500 text-white hover:bg-slate-700 text-xs h-8 bg-transparent">
                      Liên hệ
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Grid danh mục + features — bên phải */}
            <div className="flex-1 min-w-0">
              {/* Mobile h1 — chỉ hiện khi không có banner */}
              <h1 className="lg:hidden text-lg font-bold text-slate-900 mb-3">
                Cơ Khí Khải Hào — Phụ tùng chính hãng
              </h1>

              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                  Danh Mục Sản Phẩm
                </h2>
                <Link
                  href="/san-pham"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  Tất cả <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {categories.map((cat) => {
                  const IconComponent: LucideIcon = categoryIconMap[cat.slug] ?? Settings;
                  return (
                    <Link
                      key={cat.id}
                      href={`/san-pham/${cat.slug}`}
                      className="group flex flex-col items-center gap-1.5 p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg transition-all text-center"
                    >
                      <IconComponent className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <span className="text-xs font-medium text-slate-700 group-hover:text-blue-700 line-clamp-2 leading-tight">
                        {cat.name}
                      </span>
                    </Link>
                  );
                })}
                <Link
                  href="/san-pham"
                  className="flex flex-col items-center gap-1.5 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center"
                >
                  <span className="text-white font-bold text-lg leading-none">+</span>
                  <span className="text-xs font-medium text-blue-100 leading-tight">
                    Tất cả
                  </span>
                </Link>
              </div>

              {/* Features strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { icon: ShieldCheck, text: "Hàng chính hãng", color: "green" },
                  { icon: Wrench, text: "Gia công CNC", color: "blue" },
                  { icon: Truck, text: "Giao hàng nhanh", color: "orange" },
                  { icon: Tag, text: "Giá cạnh tranh", color: "purple" },
                ].map(({ icon: Icon, text, color }) => (
                  <div
                    key={text}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${
                      color === "green"
                        ? "bg-green-50 border-green-100 text-green-700"
                        : color === "blue"
                        ? "bg-blue-50 border-blue-100 text-blue-700"
                        : color === "orange"
                        ? "bg-orange-50 border-orange-100 text-orange-700"
                        : "bg-purple-50 border-purple-100 text-purple-700"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SẢN PHẨM NỔI BẬT ── */}
      {featuredProducts.length > 0 && (
        <section className="bg-white border-b border-slate-200 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full inline-block" />
                Sản Phẩm Nổi Bật
              </h2>
              <Link href="/san-pham" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                Xem thêm <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/san-pham/chi-tiet/${product.slug}`}
                  className="group flex gap-3 items-center bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 hover:border-yellow-300 rounded-lg p-3 transition-all"
                >
                  <div className="w-14 h-14 relative rounded-md overflow-hidden bg-white border border-yellow-200 shrink-0">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <Settings className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-mono mb-0.5 truncate">{product.sku}</p>
                    <h3 className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 line-clamp-2 leading-snug mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm font-bold">
                      {product.priceOnRequest ? (
                        <span className="text-red-600 text-xs">Liên hệ báo giá</span>
                      ) : (
                        <span className="text-blue-700">{formatPrice(product.price)}</span>
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CATALOG: SẢN PHẨM MỚI NHẤT ── */}
      <section className="py-5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block" />
              Sản Phẩm Mới Nhất
            </h2>
            <Link href="/san-pham" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
              Xem toàn bộ catalog <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {latestProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
              <Settings className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400">Chưa có sản phẩm nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {latestProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/san-pham/chi-tiet/${product.slug}`}
                  className="group flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="aspect-square bg-slate-50 relative overflow-hidden">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Settings className="w-10 h-10 text-slate-200" />
                      </div>
                    )}
                    {product.priceOnRequest && (
                      <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        BÁO GIÁ
                      </span>
                    )}
                  </div>
                  <div className="p-2.5 flex flex-col gap-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 truncate">{product.category.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 rounded shrink-0 ml-1">{product.sku}</span>
                    </div>
                    <h3 className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-sm font-bold mt-auto pt-0.5">
                      {product.priceOnRequest ? (
                        <span className="text-red-600 text-xs">Liên hệ</span>
                      ) : (
                        <span className="text-blue-700">{formatPrice(product.price)}</span>
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-6">
            <Link href="/san-pham">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                Xem toàn bộ catalog <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA compact ── */}
      <section className="bg-slate-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-white font-bold text-lg mb-1">
                Cần gia công chi tiết máy theo bản vẽ?
              </h2>
              <p className="text-slate-400 text-sm">
                Tiện CNC, phay CNC, mài — Báo giá trong 2 giờ làm việc.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/lien-he">
                <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
                  Gửi bản vẽ ngay
                </Button>
              </Link>
              <a href="tel:0901234567">
                <Button variant="outline" className="border-slate-500 text-white hover:bg-slate-700 bg-transparent text-sm">
                  <Phone className="w-4 h-4 mr-2" /> 090 123 4567
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
