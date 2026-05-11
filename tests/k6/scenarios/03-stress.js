import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, PAGES } from '../helpers/config.js';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '30s', target: 30 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 80 },
    { duration: '1m', target: 80 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],  // Nới lỏng: chấp nhận 5% lỗi
    http_req_duration: ['p(95)<5000'],
  },
};

export default function () {
  // Thêm chuỗi random vào query để ép Next.js render lại và query DB (bỏ qua cache)
  const randomParam = Math.random().toString(36).substring(7);
  const res = http.get(`${BASE_URL}${PAGES.products}?nocache=${randomParam}`);
  check(res, { 'status ok': (r) => r.status < 500 });
  sleep(1);
}
