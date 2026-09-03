# Cơ Khí Khải Hào (ckkh) - Website B2B & Hệ Thống Báo Giá Phụ Tùng Cơ Khí

Hệ thống Website giới thiệu sản phẩm, tra cứu thông số kỹ thuật và gửi **Yêu cầu báo giá B2B (Request for Quotation - RFQ)** cho công ty **Cơ Khí Khải Hào**. Built with **Next.js 16 (App Router)**, **React 19**, **PostgreSQL** & **Prisma ORM**.

---

## 🌟 Tính Năng Chính (Key Features)

### 🛒 Dành cho Khách Hàng / Doanh Nghiệp (Public Site)

- **Catalog Sản Phẩm & Thuộc Tính Kỹ Thuật (EAV Pattern):** Tra cứu phụ tùng/thiết bị theo Danh mục đa cấp, Thương hiệu, Thông số kỹ thuật (Kích thước, Tải trọng, Vận tốc v.v.).
- **Tìm Kiếm & Bộ Lọc Đa Năng:** Lọc linh hoạt theo khoảng số, checkbox, dropdown thuộc tính và từ khóa.
- **Giỏ Báo Giá B2B (Quote Cart):**
  - Chọn nhiều sản phẩm, điều chỉnh số lượng.
  - Tự động tính **Tổng tạm tính** đối với sản phẩm có giá niêm yết.
  - Hỗ trợ sản phẩm **Giá theo yêu cầu (`priceOnRequest`)**.
  - Xuất / In file PDF đơn báo giá trực tiếp trên trình duyệt (`@media print`).
- **Form Gửi Yêu Cầu Báo Giá (RFQ):** Thu thập thông tin doanh nghiệp (Họ tên, Công ty, SĐT, Email, Ghi chú) kèm bảo mật Rate Limiting chống spam.
- **Email Thông Báo Tự Động:** Gửi email xác nhận tức thì cho Khách hàng và thông báo đơn mới tới Admin qua Nodemailer SMTP.

### 🛡️ Dành cho Quản Trị Viên (Admin Portal)

- **Quản Lý Báo Giá (`/admin/bao-gia`):** Theo dõi danh sách đơn báo giá, xem thông tin công ty, chi tiết từng dòng sản phẩm & cập nhật trạng thái xử lý (`Mới` ➔ `Đang xử lý` ➔ `Đã phản hồi`).
- **Quản Lý Danh Mục & Thuộc Tính (`/admin/danh-muc`, `/admin/thuoc-tinh`):** Cấu hình cây danh mục và các bộ thuộc tính động (mm, kN, rpm...).
- **Quản Lý Sản Phẩm & Thương Hiệu (`/admin/san-pham`, `/admin/thuong-hieu`):** Thêm/sửa/xóa sản phẩm, SKU, giá cả, hình ảnh và thương hiệu.
- **Quản Lý Nội Dung & Banner (`/admin/noi-dung`, `/admin/banner`):** Tùy chỉnh các thông tin tĩnh và banner trang chủ.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành phần               | Công nghệ / Thư viện                                                      |
| :----------------------- | :------------------------------------------------------------------------ |
| **Framework**            | Next.js 16 (App Router), React 19, TypeScript 5                           |
| **Styling & UI**         | Tailwind CSS v4, Shadcn UI / Radix UI, Lucide Icons, Sonner, Next Themes  |
| **Database & ORM**       | PostgreSQL 16 (Docker), Prisma ORM 7 (`@prisma/adapter-pg`, `pg`)         |
| **Xác thực & Bảo mật**   | NextAuth.js v4, BcryptJS, DOMPurify, Custom Rate Limiter                  |
| **Form & Validation**    | React Hook Form, Zod Schema                                               |
| **Dịch vụ Email & File** | Nodemailer (Gmail SMTP), PapaParse (CSV Seed), Sharp (Image Optimization) |
| **Kiểm thử (Testing)**   | Vitest (Unit/API Test), Playwright (E2E Test), k6 (Load Test)             |
| **DevOps**               | Docker, Docker Compose                                                    |

---

## 📁 Cấu Trúc Thư Mục (Project Structure)

```text
ckkh/
├── prisma/
│   ├── schema.prisma      # Cấu hình Database Models & Relationships
│   ├── seed.ts            # Script khởi tạo dữ liệu mẫu
│   └── seed-csv.ts        # Script seed dữ liệu từ file CSV
├── public/                # Static assets (images, uploads...)
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (public)/      # Các trang Public (Trang chủ, Sản phẩm, Báo giá, Liên hệ...)
│   │   ├── admin/         # Trang Quản trị (Login & Admin Dashboard)
│   │   └── api/           # API Routes (Gửi báo giá, Admin APIs, Auth, Upload...)
│   ├── components/        # UI Components (Quote, Product, Layout, Admin...)
│   ├── lib/               # Utility functions (Prisma client, Mailer, Rate limit, Quote Cart...)
│   └── types/             # TypeScript Types/Interfaces
├── tests/                 # Benchmark & k6 load tests
├── docker-compose.yml     # Docker setup cho PostgreSQL
└── package.json           # Project dependencies & scripts
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng (Getting Started)

### Yêu cầu hệ thống:

- **Node.js**: v20.x trở lên
- **npm**: v10.x trở lên
- **Docker & Docker Compose** (để chạy PostgreSQL)

### Các bước cài đặt:

1. **Clone repository và cài đặt dependencies:**

   ```bash
   git clone https://github.com/Ducy277/co-khi-khai-hao.git
   cd ckkh
   npm install
   ```

2. **Cấu hình biến môi trường (`.env`):**
   Tạo file `.env` tại thư mục gốc dự án (hoặc sao chép từ cấu hình bên dưới):

   ```env
   DATABASE_URL="postgresql://ckkh_user:ckkh_pass@localhost:5432/ckkh"
   NEXTAUTH_SECRET="ckkh-super-secret-key-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"

   ADMIN_EMAIL="admin@ckkh.vn"
   ADMIN_PASSWORD="Admin@123456"

   NEXT_PUBLIC_SITE_NAME="Cơ Khí Khải Hào"
   NEXT_PUBLIC_PHONE="0945090943"
   NEXT_PUBLIC_EMAIL="khaihao.99@gmail.com"

   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   SMTP_FROM="<your-email@gmail.com>"
   ```

3. **Khởi chạy cơ sở dữ liệu PostgreSQL bằng Docker:**

   ```bash
   docker-compose up -d
   ```

4. **Khởi tạo Database Schema & Seed dữ liệu mẫu:**

   ```bash
   npx prisma db push
   npm run seed
   ```

5. **Khởi chạy Server ở môi trường phát triển (Development):**
   ```bash
   npm run dev
   ```
   Truy cập ứng dụng tại: `http://localhost:3000`  
   Trang quản trị Admin: `http://localhost:3000/admin/login` (Tài khoản: `admin@ckkh.vn` / `Admin@123456`)

---

## 📜 Danh Sách Lệnh (Available Scripts)

| Lệnh                    | Mô tả                                                     |
| :---------------------- | :-------------------------------------------------------- |
| `npm run dev`           | Chạy ứng dụng ở chế độ Development (`localhost:3000`)     |
| `npm run build`         | Biên dịch ứng dụng cho Production                         |
| `npm run start`         | Chạy Production server sau khi build                      |
| `npm run lint`          | Kiểm tra lỗi code bằng ESLint                             |
| `npm run test`          | Chạy Unit Test với Vitest                                 |
| `npm run test:coverage` | Chạy Unit Test và xuất báo cáo độ phủ mã nguồn (Coverage) |
| `npm run seed`          | Khởi tạo dữ liệu mẫu (Admin, Danh mục, Sản phẩm, Banner)  |
| `npm run seed:csv`      | Seed dữ liệu sản phẩm từ file CSV                         |

---

## 📝 Giấy Phép (License)

Dự án thuộc bản quyền sở hữu của **Cơ Khí Khải Hào**. Mọi quyền được bảo lưu.
