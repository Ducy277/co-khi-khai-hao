import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, PAGES, THRESHOLDS } from '../helpers/config.js';

export const options = {
  vus: 1,          // 1 user ảo
  duration: '30s', // chạy 30 giây
  thresholds: THRESHOLDS,
};

export default function () {
  // Test trang chủ
  let res = http.get(`${BASE_URL}${PAGES.homepage}`);
  check(res, {
    'homepage status 200': (r) => r.status === 200,
    'homepage < 3s': (r) => r.timings.duration < 3000,
  });

  sleep(1);

  // Test API health
  res = http.get(`${BASE_URL}${PAGES.health}`);
  check(res, {
    'health status 200': (r) => r.status === 200,
    'health response has ok': (r) => r.json('status') === 'ok',
  });

  sleep(1);

  // Test trang sản phẩm (có DB query)
  res = http.get(`${BASE_URL}${PAGES.products}`);
  check(res, {
    'products page status 200': (r) => r.status === 200,
    'products page < 5s': (r) => r.timings.duration < 5000,
  });

  sleep(2);
}
