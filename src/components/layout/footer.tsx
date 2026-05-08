import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Youtube, Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 font-sans border-t-[4px] border-primary">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Cột 1: Thông tin công ty */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white fill-current" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">{process.env.NEXT_PUBLIC_SITE_NAME || "Cơ Khí Khải Hào"}</h3>
            </div>
            <p className="text-sm leading-relaxed border-l-2 border-primary pl-4 text-slate-300">
              Nhà cung cấp vật tư cơ khí & dịch vụ gia công chính xác.
              <br/>
              &quot;Vận hành liên tục - Đồng hành phát triển&quot;.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 border border-slate-700 flex items-center justify-center hover:border-primary hover:bg-primary hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 border border-slate-700 flex items-center justify-center hover:border-red-600 hover:bg-red-600 hover:text-white transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Cột 2: Danh mục */}
          <div>
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-slate-700 pb-2">Hệ Thống Vật Tư</h3>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link href="/san-pham/o-bi" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-slate-600">•</span> Ổ bi & Vòng bi</Link></li>
              <li><Link href="/san-pham/banh-rang" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-slate-600">•</span> Bánh răng & Nhông xích</Link></li>
              <li><Link href="/san-pham/day-dai" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-slate-600">•</span> Dây đai truyền động</Link></li>
              <li><Link href="/san-pham/khop-noi" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-slate-600">•</span> Khớp nối tĩnh/động</Link></li>
              <li><Link href="/san-pham/bu-long" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-slate-600">•</span> Bu lông, Ốc vít chịu lực</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-slate-700 pb-2">Hỗ Trợ Khách Hàng</h3>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link href="/gioi-thieu" className="hover:text-primary transition-colors">Về chúng tôi</Link></li>
              <li><Link href="/bao-gia" className="hover:text-primary transition-colors">Quy trình Báo Giá & Đặt Hàng</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Chính sách Bảo hành</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Vận chuyển & Giao nhận</Link></li>
              <li><Link href="/lien-he" className="hover:text-primary transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-slate-700 pb-2">Thông Tin Liên Hệ</h3>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start bg-slate-800 p-4 border-l-4 border-primary shadow-sm">
                <MapPin className="w-5 h-5 text-primary mr-3 shrink-0" />
                <span className="text-slate-300">{process.env.NEXT_PUBLIC_ADDRESS || "123 Đường Công Nghiệp, KCN ABC, TP.HCM"}</span>
              </li>
              <li className="flex items-center bg-white text-slate-900 p-4 shadow-sm border border-slate-200">
                <Phone className="w-5 h-5 text-primary mr-3" />
                <span className="font-bold text-lg">{process.env.NEXT_PUBLIC_PHONE || "090 123 4567"}</span>
              </li>
              <li className="flex items-center p-2 border-l-2 border-slate-600">
                <Mail className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <span className="text-primary font-medium hover:underline">{process.env.NEXT_PUBLIC_EMAIL || "admin@ckkh.vn"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME || "CƠ KHÍ KHẢI HÀO"}. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-slate-300">Điều khoản sử dụng</Link>
            <Link href="#" className="hover:text-slate-300">Bảo mật thông tin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
