import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, PAGES, THRESHOLDS } from '../helpers/config.js';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up: 0 → 10 users trong 30s
    { duration: '1m', target: 10 },   // Duy trì 10 users trong 1 phút
    { duration: '30s', target: 20 },  // Tăng lên 20 users trong 30s
    { duration: '1m', target: 20 },   // Duy trì 20 users trong 1 phút
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: THRESHOLDS,
};

// Mô phỏng hành vi thực tế của 1 user duyệt web
export default function () {
  // 1. Vào trang chủ
  http.get(`${BASE_URL}${PAGES.homepage}`);
  sleep(Math.random() * 3 + 1); // Đọc trang 1-4 giây

  // 2. Xem danh sách sản phẩm
  http.get(`${BASE_URL}${PAGES.products}`);
  sleep(Math.random() * 3 + 2);

  // 3. Filter theo danh mục
  http.get(`${BASE_URL}${PAGES.category}`);
  sleep(Math.random() * 2 + 1);

  // 4. Xem chi tiết sản phẩm
  const res = http.get(`${BASE_URL}${PAGES.productDetail}`);
  check(res, {
    'product detail loaded': (r) => r.status === 200,
    'product detail < 3s': (r) => r.timings.duration < 3000,
  });
  sleep(Math.random() * 5 + 3); // Đọc chi tiết 3-8 giây
}
