import { test, expect } from "@playwright/test";

test.describe("Admin Auth Flow", () => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@ckkh.vn";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

  test("Chặn truy cập admin khi chưa đăng nhập", async ({ page }) => {
    await page.goto("/admin/bao-gia");
    // Phải bị redirect về trang login
    await expect(page).toHaveURL(/.*\/admin\/login/);
  });

  test("Đăng nhập sai không cho vào", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@ckkh.vn");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page.locator("text=Email hoặc mật khẩu không chính xác")).toBeVisible();
  });

  test("Admin đăng nhập thành công", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    // Phải chuyển vào trang dashboard hoặc danh sách
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.locator("text=Đăng xuất")).toBeVisible();
  });
});
