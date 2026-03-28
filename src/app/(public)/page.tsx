import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Factory, Wrench, ShieldCheck, Truck, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Cơ Khí Khải Hào - Phụ tùng chính hãng & Dịch vụ gia công",
  description: "Chuyên cung cấp vật tư phụ tùng cơ khí công nghiệp uy tín, vòng bi, bánh răng, dây đai. Dịch vụ gia công chi tiết máy theo bản vẽ kỹ thuật.",
};

export default async function HomePage() {
  const [featuredProducts, categories, heroBanner] = await Promise.all([
    prisma.product.findMany({
      where: { 
        isActive: true,
        isFeatured: true 
      },
      take: 8,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        },
        category: true
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.category.findMany({
      where: { parentId: null }, // Lấy danh mục gốc làm nổi bật
      take: 6,
      orderBy: { sortOrder: "asc" }
    }),
    prisma.banner.findFirst({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const bannerTitle = heroBanner?.title || "Vật Tư Cơ Khí Chính Hãng & Gia Công Chuyên Nghiệp";
  const bannerSubtitle =
    heroBanner?.subtitle ||
    "Cơ Khí Khải Hào cung cấp giải pháp phụ tùng công nghiệp toàn diện: Ổ bi, bánh răng, xích tải chất lượng cao. Nhận gia công chi tiết máy theo bản vẽ với độ chính xác tuyệt đối.";
  const bannerImage =
    heroBanner?.image ||
    "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80";
  const bannerLink = heroBanner?.link || "/san-pham";

  const formatPrice = (price: unknown) => {
    if (!price) return "—";
    const num = Number(price);
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cokhikhaihao.vn";

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "Organization", "AutoPartsStore"],
        "@id": `${BASE_URL}/#organization`,
        name: "Cơ Khí Khải Hào",
        url: BASE_URL,
        description: "Chuyên cung cấp vật tư phụ tùng cơ khí công nghiệp uy tín. Ổ bi, bánh răng, dây đai chính hãng. Dịch vụ gia công chi tiết máy theo bản vẽ.",
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
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
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

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* JSON-LD LocalBusiness Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      {/* 1. Hero Banner Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <Image 
              src={bannerImage}
              alt="Xưởng cơ khí"
              fill
              className="object-cover"
              priority
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight mb-6">
              {bannerTitle}
            </h1>
            <p className="text-lg lg:text-xl text-slate-300 mb-8 leading-relaxed max-w-xl">
              {bannerSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <Link href={bannerLink}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base h-12 px-8 w-full sm:w-auto">
                  Khám phá sản phẩm <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
               </Link>
               <Link href="/dich-vu">
                <Button size="lg" variant="outline" className="border-slate-400 text-slate-800 hover:bg-slate-100 bg-white text-base h-12 px-8 w-full sm:w-auto">
                  Dịch vụ gia công
                </Button>
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features/Benefits */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center p-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Hàng Chính Hãng</h3>
              <p className="text-sm text-slate-500">Cam kết nguồn gốc xuất xứ rõ ràng 100%.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
                <Wrench className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Đa Dạng Sản Phẩm</h3>
              <p className="text-sm text-slate-500">Cung cấp hàng nghìn mã vật tư công nghiệp.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
                <Factory className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Gia Công Bản Vẽ</h3>
              <p className="text-sm text-slate-500">Tiện, phay, mài CNC chính xác theo yêu cầu.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Giao Hàng Nhanh</h3>
              <p className="text-sm text-slate-500">Hỗ trợ vận chuyển tận nhà máy toàn quốc.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Phân Loại Danh Mục Nổi Bật */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Danh Mục Sản Phẩm</h2>
            <p className="text-slate-600">Tìm kiếm nhanh chóng các nhóm vật tư cơ khí thường dùng nhất từ hệ thống của chúng tôi.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/san-pham/${category.slug}`} className="group relative bg-white rounded-xl p-6 text-center shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all">
                 <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                   {/* Dùng icon chung, có thể nâng cấp gắn icon riêng từng category sau */}
                   <Settings className="w-8 h-8 text-slate-500 group-hover:text-blue-600 transition-colors" />
                 </div>
                 <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">{category.name}</h3>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link href="/san-pham" className="text-blue-600 font-semibold hover:underline inline-flex items-center">
              Xem toàn bộ danh mục <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Sản Phẩm Nổi Bật */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Sản Phẩm Nổi Bật</h2>
              <p className="text-slate-600">Các mặt hàng vật tư cơ khí được tin dùng và bán chạy nhất tại Khải Hào.</p>
            </div>
            <Link href="/san-pham" className="hidden md:inline-flex text-blue-600 font-semibold hover:underline items-center pb-1">
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/san-pham/chi-tiet/${product.slug}`} className="group flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all hover:border-blue-300">
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  {product.images[0] ? (
                    <Image 
                      src={product.images[0].url} 
                      alt={product.images[0].alt || product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <Settings className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                  {product.priceOnRequest && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                      MUA ĐẶT HÀNG
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
                    <span>{product.category.name}</span>
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{product.sku}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 flex-grow">
                    {product.name}
                  </h3>
                  <div className="mt-auto">
                    {product.priceOnRequest ? (
                      <p className="text-red-600 font-bold text-lg">Liên hệ báo giá</p>
                    ) : (
                      <p className="text-blue-700 font-bold text-lg">{formatPrice(product.price)}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {featuredProducts.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <p className="text-slate-500">Chưa có sản phẩm nổi bật nào được chọn.</p>
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link href="/san-pham">
              <Button variant="outline" className="w-full">
                Xem tất cả sản phẩm
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Cấp tốc liên hệ / Call to action */}
      <section className="py-20 bg-blue-700 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-800/50 [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Bạn Cần Gia Công Chi Tiết Máy Theo Bản Vẽ?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-3xl mx-auto">
            Gửi yêu cầu gia công cho Cơ Khí Khải Hào để nhận báo giá cạnh tranh nhất và thời gian hoàn thành nhanh nhất. Cam kết chất lượng thành phẩm đạt độ dung sai lý tưởng.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link href="/lien-he">
               <Button size="lg" className="bg-white text-blue-700 hover:bg-slate-100 text-base h-14 px-8 w-full sm:w-auto font-bold shadow-lg">
                 Gửi bản vẽ ngay
               </Button>
             </Link>
             <a href="tel:0901234567">
               <Button size="lg" variant="outline" className="border-blue-400 bg-blue-600/50 hover:bg-blue-600 text-white text-base h-14 px-8 w-full sm:w-auto font-semibold">
                 Gọi tư vấn trực tiếp
               </Button>
             </a>
          </div>
        </div>
      </section>
    </div>
  );
}
