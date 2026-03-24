import prisma from "@/lib/prisma";

export const metadata = {
  title: "Liên hệ | Cơ Khí Khải Hào",
  description: "Thông tin liên hệ Cơ Khí Khải Hào: hotline, email, địa chỉ và bản đồ.",
};

export default async function ContactPage() {
  const mapEmbed = await prisma.siteContent.findUnique({
    where: { key: "contact_map_embed" },
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Liên hệ</h1>
        <p className="text-slate-600 text-lg mb-8">
          Cần tư vấn phụ tùng hoặc gia công theo bản vẽ? Liên hệ ngay với chúng tôi.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Thông tin liên hệ</h2>
            <div className="space-y-3 text-slate-600">
              <p><strong>Hotline:</strong> 090 123 4567</p>
              <p><strong>Email:</strong> admin@ckkh.vn</p>
              <p><strong>Zalo:</strong> 090 123 4567</p>
              <p><strong>Giờ làm việc:</strong> 08:00 - 17:30 (T2 - T7)</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[260px]">
            {mapEmbed?.value ? (
              <iframe
                src={mapEmbed.value}
                className="w-full h-full min-h-[260px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ Cơ Khí Khải Hào"
              />
            ) : (
              <div className="h-full min-h-[260px] flex items-center justify-center text-slate-500 text-sm p-6 text-center">
                Chưa cấu hình Google Maps embed URL trong CMS (key: contact_map_embed).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
