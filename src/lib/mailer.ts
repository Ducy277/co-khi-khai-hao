import nodemailer from "nodemailer";

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Nodemailer transporter dùng Gmail SMTP với App Password.
 * Để đổi tài khoản: chỉ cần cập nhật SMTP_USER và SMTP_PASS trong .env
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // STARTTLS (port 587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface QuoteEmailData {
  quoteId: number;
  customerName: string;
  company?: string | null;
  phone: string;
  email?: string | null;
  note?: string | null;
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
    unitPrice?: number | null;
  }>;
  estimatedTotal?: number;
}

/**
 * Gửi email thông báo đến admin khi có yêu cầu báo giá mới.
 */
export async function sendQuoteNotificationToAdmin(data: QuoteEmailData) {
  const adminEmail = process.env.SMTP_USER!;
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Cơ Khí Khải Hào";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const itemsHtml = data.items
    .map((item, i) => {
      const priceStr = item.unitPrice ? new Intl.NumberFormat("vi-VN").format(item.unitPrice) + " đ" : "Liên hệ";
      const totalStr = item.unitPrice ? new Intl.NumberFormat("vi-VN").format(item.unitPrice * item.quantity) + " đ" : "—";
      return `
      <tr style="background:${i % 2 === 0 ? "#f8fafc" : "#ffffff"}">
        <td style="padding:8px 12px;border:1px solid #e2e8f0;">${i + 1}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;">${escapeHtml(item.productName)}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;font-family:monospace;">${escapeHtml(item.sku)}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:right;">${priceStr}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:right;font-weight:bold;">${totalStr}</td>
      </tr>`;
    })
    .join("");

  const totalHtml = (data.estimatedTotal && data.estimatedTotal > 0) ? `
      <tr>
        <td colspan="5" style="padding:10px 12px;border:1px solid #e2e8f0;text-align:right;font-weight:bold;background:#eef2ff;">Tổng tạm tính:</td>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;text-align:right;font-weight:bold;color:#b91c1c;background:#eef2ff;">
          ${new Intl.NumberFormat("vi-VN").format(data.estimatedTotal)} đ
        </td>
      </tr>` : "";

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;font-family:Arial,sans-serif;background:#f1f5f9;padding:20px;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#1e3a5f;padding:20px 28px;">
      <h1 style="margin:0;color:#ffffff;font-size:18px;">🔔 Yêu cầu báo giá mới #${data.quoteId}</h1>
      <p style="margin:4px 0 0;color:#93c5fd;font-size:13px;">${siteName}</p>
    </div>

    <!-- Body -->
    <div style="padding:24px 28px;">

      <!-- Thông tin khách hàng -->
      <h2 style="margin:0 0 12px;font-size:15px;color:#1e293b;border-bottom:2px solid #3b82f6;padding-bottom:6px;">
        Thông tin khách hàng
      </h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding:6px 0;color:#64748b;width:140px;">Họ tên:</td>
          <td style="padding:6px 0;font-weight:bold;color:#0f172a;">${escapeHtml(data.customerName)}</td>
        </tr>
        ${data.company ? `<tr><td style="padding:6px 0;color:#64748b;">Công ty:</td><td style="padding:6px 0;color:#0f172a;">${escapeHtml(data.company)}</td></tr>` : ""}
        <tr>
          <td style="padding:6px 0;color:#64748b;">Số điện thoại:</td>
          <td style="padding:6px 0;color:#0f172a;"><a href="tel:${escapeHtml(data.phone)}" style="color:#2563eb;">${escapeHtml(data.phone)}</a></td>
        </tr>
        ${data.email ? `<tr><td style="padding:6px 0;color:#64748b;">Email:</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color:#2563eb;">${escapeHtml(data.email)}</a></td></tr>` : ""}
        ${data.note ? `<tr><td style="padding:6px 0;color:#64748b;vertical-align:top;">Ghi chú:</td><td style="padding:6px 0;color:#0f172a;">${escapeHtml(data.note)}</td></tr>` : ""}
      </table>

      <!-- Danh sách sản phẩm -->
      <h2 style="margin:0 0 12px;font-size:15px;color:#1e293b;border-bottom:2px solid #3b82f6;padding-bottom:6px;">
        Sản phẩm yêu cầu báo giá (${data.items.length} mặt hàng)
      </h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px;">
        <thead>
          <tr style="background:#1e3a5f;color:#ffffff;">
            <th style="padding:8px 12px;border:1px solid #1e3a5f;text-align:left;">#</th>
            <th style="padding:8px 12px;border:1px solid #1e3a5f;text-align:left;">Tên sản phẩm</th>
            <th style="padding:8px 12px;border:1px solid #1e3a5f;text-align:left;">SKU</th>
            <th style="padding:8px 12px;border:1px solid #1e3a5f;text-align:right;">Đơn giá</th>
            <th style="padding:8px 12px;border:1px solid #1e3a5f;text-align:center;">SL</th>
            <th style="padding:8px 12px;border:1px solid #1e3a5f;text-align:right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          ${totalHtml}
        </tbody>
      </table>

      <!-- CTA -->
      <div style="text-align:center;margin-top:24px;">
        <a href="${siteUrl}/admin/bao-gia"
           style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:bold;font-size:14px;">
          Xem & Xử lý yêu cầu →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:14px 28px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">
        Email tự động từ hệ thống ${siteName} — Không reply trực tiếp vào email này.
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: adminEmail,
    subject: `[${siteName}] Yêu cầu báo giá mới #${data.quoteId} — ${data.customerName}`,
    html,
  });
}

/**
 * Gửi email xác nhận đến khách hàng sau khi submit thành công.
 */
export async function sendQuoteConfirmationToCustomer(data: QuoteEmailData) {
  if (!data.email) return; // Không có email khách thì bỏ qua
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Cơ Khí Khải Hào";
  const phone = process.env.NEXT_PUBLIC_PHONE || "090 123 4567";

  const itemsHtml = data.items
    .map((item, i) => {
      const priceStr = item.unitPrice ? new Intl.NumberFormat("vi-VN").format(item.unitPrice) + " đ" : "Liên hệ";
      const totalStr = item.unitPrice ? new Intl.NumberFormat("vi-VN").format(item.unitPrice * item.quantity) + " đ" : "—";
      return `
      <tr style="background:${i % 2 === 0 ? "#f8fafc" : "#ffffff"}">
        <td style="padding:8px 12px;border:1px solid #e2e8f0;">${escapeHtml(item.productName)}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;font-family:monospace;">${escapeHtml(item.sku)}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:right;">${priceStr}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:right;font-weight:bold;">${totalStr}</td>
      </tr>`;
    })
    .join("");

  const totalHtml = (data.estimatedTotal && data.estimatedTotal > 0) ? `
      <tr>
        <td colspan="4" style="padding:10px 12px;border:1px solid #e2e8f0;text-align:right;font-weight:bold;background:#eef2ff;">Tổng tạm tính:</td>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;text-align:right;font-weight:bold;color:#b91c1c;background:#eef2ff;">
          ${new Intl.NumberFormat("vi-VN").format(data.estimatedTotal)} đ
        </td>
      </tr>` : "";

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;font-family:Arial,sans-serif;background:#f1f5f9;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">

    <div style="background:#1e3a5f;padding:20px 28px;">
      <h1 style="margin:0;color:#ffffff;font-size:18px;">✅ Chúng tôi đã nhận yêu cầu của bạn!</h1>
      <p style="margin:4px 0 0;color:#93c5fd;font-size:13px;">${siteName}</p>
    </div>

    <div style="padding:24px 28px;">
      <p style="color:#374151;line-height:1.6;">
        Xin chào <strong>${escapeHtml(data.customerName)}</strong>,<br>
        Yêu cầu báo giá <strong>#${data.quoteId}</strong> của bạn đã được ghi nhận thành công.
        Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất (thường trong vòng <strong>2 giờ làm việc</strong>).
      </p>

      <h2 style="margin:20px 0 12px;font-size:15px;color:#1e293b;border-bottom:2px solid #3b82f6;padding-bottom:6px;">
        Sản phẩm đã yêu cầu
      </h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px;">
        <thead>
          <tr style="background:#1e3a5f;color:#ffffff;">
            <th style="padding:8px 12px;border:1px solid #1e3a5f;text-align:left;">Sản phẩm</th>
            <th style="padding:8px 12px;border:1px solid #1e3a5f;text-align:left;">SKU</th>
            <th style="padding:8px 12px;border:1px solid #1e3a5f;text-align:right;">Đơn giá</th>
            <th style="padding:8px 12px;border:1px solid #1e3a5f;text-align:center;">SL</th>
            <th style="padding:8px 12px;border:1px solid #1e3a5f;text-align:right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          ${totalHtml}
        </tbody>
      </table>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:14px 18px;">
        <p style="margin:0;font-size:13px;color:#1e40af;">
          📞 Nếu cần hỗ trợ khẩn cấp, vui lòng gọi trực tiếp: <strong>${phone}</strong>
        </p>
      </div>
    </div>

    <div style="background:#f8fafc;padding:14px 28px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">
        ${siteName} — Email xác nhận tự động, vui lòng không reply.
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.email,
    subject: `Xác nhận yêu cầu báo giá #${data.quoteId} — ${siteName}`,
    html,
  });
}
