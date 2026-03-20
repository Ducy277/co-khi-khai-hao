import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import OptionClientRenderer from "./_components/option-client";

export const metadata = {
  title: "Quản lý Tuỳ chọn Thuộc tính | Admin",
};

export default async function AttributeOptionsPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const attributeId = parseInt(p.id, 10);
  if (isNaN(attributeId)) return notFound();

  const attribute = await prisma.categoryAttribute.findUnique({
    where: { id: attributeId },
    include: {
      options: {
        orderBy: { sortOrder: "asc" }
      }
    }
  });

  if (!attribute) return notFound();

  if (attribute.type !== "select") {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Lỗi: Thuộc tính này không phải dạng Lựa chọn (Select) nên không có Tuỳ chọn (Options).
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/admin/thuoc-tinh" className="text-blue-600 hover:underline flex items-center text-sm">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Quay lại danh sách thuộc tính
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Tuỳ chọn: <span className="text-blue-600">{attribute.name}</span>
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý các giá trị có thể chọn của thuộc tính này.
          </p>
        </div>
      </div>

      <OptionClientRenderer attributeId={attribute.id} initialOptions={attribute.options} />
    </div>
  );
}
