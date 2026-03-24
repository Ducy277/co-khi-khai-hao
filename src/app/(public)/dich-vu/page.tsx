import prisma from "@/lib/prisma";

export const metadata = {
  title: "Dịch vụ gia công | Cơ Khí Khải Hào",
  description: "Dịch vụ gia công cơ khí chính xác: tiện, phay, mài, cắt theo yêu cầu bản vẽ.",
};

export default async function ServicePage() {
  const serviceDescription = await prisma.siteContent.findUnique({
    where: { key: "services_description" },
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Dịch vụ gia công cơ khí</h1>
        <p className="text-slate-600 text-lg mb-8">
          Năng lực gia công linh hoạt cho doanh nghiệp sản xuất, xưởng cơ khí và nhà thầu công nghiệp.
        </p>

        <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
          <div className="prose prose-slate max-w-none">
            <p>
              {serviceDescription?.value ||
                "Xưởng gia công cơ khí chính xác với đầy đủ thiết bị hiện đại: tiện CNC, phay CNC, mài, cắt laser..."}
            </p>
            <ul>
              <li>Gia công chi tiết máy theo bản vẽ kỹ thuật.</li>
              <li>Gia công đơn chiếc hoặc theo lô số lượng lớn.</li>
              <li>Tư vấn tối ưu vật liệu và dung sai gia công.</li>
              <li>Cam kết tiến độ và kiểm soát chất lượng đầu ra.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
