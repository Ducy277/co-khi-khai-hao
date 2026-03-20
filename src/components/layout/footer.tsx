import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Cột 1: Thông tin công ty */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Cơ Khí Khải Hào</h3>
            <p className="text-sm leading-relaxed">
              Chúng tôi tự hào là đơn vị cung cấp vật tư phụ tùng cơ khí công nghiệp uy tín, 
              đồng thời cung cấp dịch vụ gia công chi tiết máy theo bản vẽ kỹ thuật chất lượng cao.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 transition-colors">
                <Youtube className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Cột 2: Danh mục */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Danh Mục Chính</h3>
            <ul className="space-y-2">
              <li><Link href="/san-pham/o-bi" className="hover:text-blue-400 transition-colors">Ổ bi & Vòng bi</Link></li>
              <li><Link href="/san-pham/banh-rang" className="hover:text-blue-400 transition-colors">Bánh răng & Nhông xích</Link></li>
              <li><Link href="/san-pham/day-dai" className="hover:text-blue-400 transition-colors">Dây đai truyền động</Link></li>
              <li><Link href="/san-pham/khop-noi" className="hover:text-blue-400 transition-colors">Khớp nối mềm</Link></li>
              <li><Link href="/san-pham/bu-long" className="hover:text-blue-400 transition-colors">Bu lông, Ốc vít</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ khách hàng */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Hỗ Trợ Khách Hàng</h3>
            <ul className="space-y-2">
              <li><Link href="/gioi-thieu" className="hover:text-blue-400 transition-colors">Giới thiệu công ty</Link></li>
              <li><Link href="/bao-gia" className="hover:text-blue-400 transition-colors">Chính sách mua hàng & Báo giá</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Chính sách bảo hành</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Vận chuyển & Đổi trả</Link></li>
              <li><Link href="/lien-he" className="hover:text-blue-400 transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Cột 4: Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Thông Tin Liên Hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Số 123 Đường Công Nghiệp, Khu Công Nghiệp ABC, TP.HCM</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                <span className="font-semibold text-white">090 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                <span>lienhe@ckkh.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Cơ Khí Khải Hào. Bảo lưu mọi quyền.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0 text-sm">
            <Link href="#" className="text-slate-500 hover:text-white">Điều khoản sử dụng</Link>
            <Link href="#" className="text-slate-500 hover:text-white">Bảo mật thông tin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
