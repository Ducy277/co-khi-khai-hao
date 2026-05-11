import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, PAGES } from '../helpers/config.js';

export const options = {
  stages: [
    { duration: '1m', target: 5 },    // Bình thường
    { duration: '30s', target: 100 }, // SPIKE: 100 users đột ngột
    { duration: '3m', target: 100 },  // Duy trì spike
    { duration: '30s', target: 5 },   // Trở về bình thường
    { duration: '2m', target: 5 },    // Xác nhận recovery
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],   // Chấp nhận 10% lỗi khi spike
    http_req_duration: ['p(95)<10000'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}${PAGES.homepage}`);
  check(res, { 'survived spike': (r) => r.status < 500 });
  sleep(1);
}
