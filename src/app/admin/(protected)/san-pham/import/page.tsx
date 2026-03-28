"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ImportReport = {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
};

export default function ImportProductsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.name.endsWith(".csv")) {
      toast.error("Vui lòng chọn file .CSV");
      return;
    }
    setFile(selected);
    setReport(null);
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/san-pham/import", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as { success?: boolean; report?: ImportReport; error?: string };

      if (!res.ok || !data.success) {
        toast.error(data.error || "Import thất bại");
        return;
      }

      setReport(data.report!);
      toast.success(
        `Import thành công! Tạo mới: ${data.report!.created} | Cập nhật: ${data.report!.updated}`
      );
    } catch {
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/san-pham">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Import Sản Phẩm từ CSV</h1>
          <p className="text-sm text-slate-500 mt-0.5">Thêm hoặc cập nhật hàng loạt sản phẩm từ file CSV</p>
        </div>
      </div>

      {/* Hướng dẫn */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Hướng dẫn chuẩn bị file CSV
        </h2>
        <ul className="space-y-1.5 text-sm text-blue-700">
          <li>• Xuất file mẫu bằng nút <strong>Xuất CSV</strong> ở trang danh sách sản phẩm để có đúng format cột.</li>
          <li>• Các cột bắt buộc: <code className="bg-blue-100 px-1 rounded">name</code>, <code className="bg-blue-100 px-1 rounded">sku</code>, <code className="bg-blue-100 px-1 rounded">categorySlug</code>.</li>
          <li>• <strong>Logic Upsert</strong>: Nếu SKU đã tồn tại → cập nhật. Nếu SKU mới → tạo mới.</li>
          <li>• Cột <code className="bg-blue-100 px-1 rounded">priceOnRequest</code>: <code className="bg-blue-100 px-1 rounded">1</code> = liên hệ, <code className="bg-blue-100 px-1 rounded">0</code> = có giá.</li>
          <li>• Cột thuộc tính bắt đầu bằng <code className="bg-blue-100 px-1 rounded">attr_</code> (ví dụ: <code className="bg-blue-100 px-1 rounded">attr_duong-kinh-trong</code>).</li>
          <li>• File phải được lưu định dạng UTF-8 (hỗ trợ tiếng Việt).</li>
        </ul>
        <div className="mt-4">
          <a href="/api/admin/san-pham/export" download>
            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              <Download className="w-4 h-4 mr-2" />
              Tải file mẫu (Xuất CSV hiện tại)
            </Button>
          </a>
        </div>
      </div>

      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          file ? "border-blue-400 bg-blue-50/50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <Upload className={`w-10 h-10 mx-auto mb-3 ${file ? "text-blue-500" : "text-slate-400"}`} />
        {file ? (
          <div>
            <p className="font-semibold text-blue-700">{file.name}</p>
            <p className="text-sm text-slate-500 mt-1">
              {(file.size / 1024).toFixed(1)} KB — Nhấn để chọn file khác
            </p>
          </div>
        ) : (
          <div>
            <p className="font-medium text-slate-700">Kéo thả hoặc nhấn để chọn file CSV</p>
            <p className="text-sm text-slate-400 mt-1">Chỉ chấp nhận file .CSV, tối đa 10MB</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <Button
          onClick={handleImport}
          disabled={!file || isUploading}
          className="bg-blue-600 hover:bg-blue-700 flex-1"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang import...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Bắt đầu Import
            </>
          )}
        </Button>
        {file && !isUploading && (
          <Button
            variant="outline"
            onClick={() => {
              setFile(null);
              setReport(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            Hủy
          </Button>
        )}
      </div>

      {/* Kết quả */}
      {report && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Kết quả Import</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-700">{report.created}</p>
              <p className="text-sm text-green-600">Tạo mới</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-700">{report.updated}</p>
              <p className="text-sm text-blue-600">Cập nhật</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-center">
              <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-slate-700">{report.skipped}</p>
              <p className="text-sm text-slate-500">Bỏ qua</p>
            </div>
          </div>

          {report.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {report.errors.length} lỗi phát sinh:
              </p>
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {report.errors.map((err, i) => (
                  <li key={i} className="text-sm text-red-600">
                    • {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <Link href="/admin/san-pham">
              <Button className="bg-blue-600 hover:bg-blue-700">Xem danh sách sản phẩm</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setReport(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Import thêm
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
