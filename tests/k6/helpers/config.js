export const BASE_URL = __ENV.BASE_URL || 'http://localhost:80';

// SLO Thresholds — ngưỡng pass/fail
export const THRESHOLDS = {
  http_req_duration: [
    'p(95)<2000',   // 95% request dưới 2 giây
    'p(99)<5000',   // 99% request dưới 5 giây
  ],
  http_req_failed: ['rate<0.01'],   // Tỉ lệ lỗi < 1%
  http_reqs: ['rate>5'],            // Throughput tối thiểu 5 req/s
};

// Các trang quan trọng cần test
export const PAGES = {
  homepage:   '/',
  products:   '/san-pham',
  productDetail: '/san-pham/chi-tiet/day-curoa-b', // Đã sửa lại đúng route
  category:   '/san-pham?loai=vong-bi',
  health:     '/api/health',
};
