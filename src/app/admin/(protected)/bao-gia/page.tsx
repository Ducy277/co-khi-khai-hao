import prisma from "@/lib/prisma";
import QuoteClientRenderer from "./_components/quote-client";

export const metadata = {
  title: "Yêu cầu báo giá | Admin",
};

export default async function QuoteRequestsPage() {
  const rawQuotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  const quotes = rawQuotes.map((q) => ({
    ...q,
    items: q.items.map((i) => ({
      ...i,
      unitPrice: i.unitPrice ? Number(i.unitPrice) : null,
    })),
  }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Yêu cầu báo giá</h1>
          <p className="text-slate-500 mt-1">
            Theo dõi và cập nhật trạng thái xử lý yêu cầu báo giá từ khách hàng.
          </p>
        </div>
      </div>

      <QuoteClientRenderer initialQuotes={quotes} />
    </div>
  );
}
