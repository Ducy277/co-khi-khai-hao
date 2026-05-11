
export const metadata = {
  title: "Liên hệ | Cơ Khí Khải Hào",
  description: "Thông tin liên hệ Cơ Khí Khải Hào: hotline, email, địa chỉ và bản đồ.",
};

export default function ContactPage() {
  // Lấy địa chỉ từ env (hoặc default)
  const address1 = process.env.NEXT_PUBLIC_ADDRESS || "57/7B Lê Đức Anh, Xã Bà Điểm, Huyện Hóc Môn, Thành phố Hồ Chí Minh, Việt Nam";
  const address2 = process.env.NEXT_PUBLIC_ADDRESS_2 || "18A Đường ĐT 743, Khu phố 1B, Phường An Phú, Thành phố Thuận An, Tỉnh Bình Dương, Việt Nam";

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
              <p><strong>Hotline:</strong> {process.env.NEXT_PUBLIC_PHONE || "0945 09 09 43"}</p>
              <p><strong>Email:</strong> {process.env.NEXT_PUBLIC_EMAIL || "khaihao.99@gmail.com"}</p>
              <p><strong>Zalo:</strong> {process.env.NEXT_PUBLIC_ZALO || "0945 09 09 43"}</p>
              <p><strong>Giờ làm việc:</strong> 08:00 - 17:30 (T2 - T7)</p>
            </div>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-4">Hệ thống cửa hàng</h2>
            <div className="space-y-4 text-slate-600">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="font-semibold text-slate-800 mb-1">Trọng Tín (Bà Điểm)</p>
                <p className="text-sm">{address1}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="font-semibold text-slate-800 mb-1">Trọng Tín (Bình Dương)</p>
                <p className="text-sm">{address2}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-[260px] flex flex-col">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-medium text-slate-700 text-sm">📍 Bản đồ Chi nhánh Bà Điểm</div>
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(address1)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full flex-1"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ chi nhánh Bà Điểm"
              />
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-[260px] flex flex-col">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-medium text-slate-700 text-sm">📍 Bản đồ Chi nhánh Bình Dương</div>
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(address2)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full flex-1"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ chi nhánh Bình Dương"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
