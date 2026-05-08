import prisma from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/sanitize";

export const metadata = {
  title: "Giới thiệu | Cơ Khí Khải Hào",
  description: "Thông tin về Cơ Khí Khải Hào, năng lực cung cấp phụ tùng và gia công cơ khí.",
};

export default async function AboutPage() {
  const [aboutShort, aboutFull] = await Promise.all([
    prisma.siteContent.findUnique({ where: { key: "about_short" } }),
    prisma.siteContent.findUnique({ where: { key: "about_full" } }),
  ]);

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Giới thiệu Cơ Khí Khải Hào</h1>
        <p className="text-slate-600 text-lg mb-8">
          {aboutShort?.value || "Cơ Khí Khải Hào - hơn 10 năm kinh nghiệm trong lĩnh vực phụ tùng cơ khí và gia công chính xác."}
        </p>

        <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 prose prose-slate max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(
                aboutFull?.value ||
                "<p>Với hơn 10 năm hoạt động trong ngành cơ khí, Cơ Khí Khải Hào tập trung cung cấp phụ tùng chính hãng và dịch vụ gia công theo yêu cầu.</p>"
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
}
