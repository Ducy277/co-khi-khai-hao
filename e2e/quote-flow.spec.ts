import { test, expect } from "@playwright/test";

test.describe("Quote Flow", () => {
  test("Khách hàng gửi báo giá thành công", async ({ page }) => {
    // 1. Mở trang /san-pham
    await page.goto("/san-pham");

    // 2. Click vào sản phẩm đầu tiên (nếu có sản phẩm)
    const productLinks = page.locator('a[href^="/san-pham/chi-tiet/"]');
    if (await productLinks.count() > 0) {
      await productLinks.first().click();

      // 3. Click "Thêm vào giỏ báo giá"
      await page.getByRole("button", { name: "Thêm vào giỏ báo giá" }).first().click();
      
      // Đợi toast thông báo
      await expect(page.locator("text=Đã thêm vào giỏ báo giá")).toBeVisible();

      // 4. Badge giỏ hàng hiển thị số 1
      await expect(page.locator("header .bg-red-500").first()).toHaveText("1");

      // 5. Mở trang /bao-gia
      await page.goto("/bao-gia");

      // 6. Điền form
      await page.fill('input[name="customerName"]', "E2E Test User");
      await page.fill('input[name="phone"]', "0987654321");
      await page.fill('input[name="email"]', "test@example.com");

      // 7. Submit
      await page.getByRole("button", { name: /Gửi yêu cầu (báo giá|đặt hàng)/i }).click();

      // 8. Thông báo thành công hiển thị
      await expect(page.locator("text=Gửi yêu cầu thành công!")).toBeVisible();
      await expect(page.locator("text=Mã yêu cầu của bạn là:")).toBeVisible();
    }
  });

  test("Validation form hoạt động đúng", async ({ page }) => {
    await page.goto("/bao-gia");
    
    // Nếu giỏ hàng trống thì sẽ có nút "Tiếp tục xem sản phẩm", nhưng ở đây
    // nếu có item thì form mới xuất hiện. Vì Playwright chạy test theo workers, 
    // localStorage có thể bị clear (mỗi test context là độc lập).
    // Ta nên thêm item trực tiếp qua script hoặc test riêng rẻ.
    // Thực thi script JS để ép có 1 item trong localStorage quoteCart.
    await page.addInitScript(() => {
      window.localStorage.setItem('ckkh_quote_cart_v1', JSON.stringify({
        items: [{
          productId: 1,
          name: "Test Product",
          slug: "test-product",
          sku: "TEST-SKU",
          price: null,
          priceOnRequest: true,
          quantity: 1
        }],
        updatedAt: new Date().toISOString()
      }));
    });

    await page.goto("/bao-gia");
    
    // Click gửi luôn không điền gì
    await page.getByRole("button", { name: /Gửi yêu cầu (báo giá|đặt hàng)/i }).click();

    // Thông báo lỗi xuất hiện
    await expect(page.locator("text=Vui lòng nhập đầy đủ họ tên và số điện thoại")).toBeVisible();
  });

  test("Rate limit hoạt động", async ({ request }) => {
    // Gọi API 6 lần liên tiếp
    const payload = {
      customerName: "Spammer",
      phone: "0123456789",
      items: [{ productId: 1, quantity: 1 }]
    };

    let status429Count = 0;
    for (let i = 0; i < 6; i++) {
      const res = await request.post("/api/bao-gia", { data: payload });
      if (res.status() === 429) {
        status429Count++;
      }
    }

    // Lần thứ 6 phải bị rate limit (429)
    expect(status429Count).toBeGreaterThanOrEqual(1);
  });
});
