import prisma from "@/lib/prisma";
import ContentClientRenderer from "./_components/content-client";

export const metadata = {
  title: "Quản lý Nội dung | Admin",
};

export default async function SiteContentPage() {
  const contents = await prisma.siteContent.findMany({
    orderBy: [{ key: "asc" }],
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nội dung</h1>
          <p className="text-slate-500 mt-1">
            Quản lý nội dung CMS cho các trang Giới thiệu, Dịch vụ và Liên hệ.
          </p>
        </div>
      </div>

      <ContentClientRenderer initialContents={contents} />
    </div>
  );
}
