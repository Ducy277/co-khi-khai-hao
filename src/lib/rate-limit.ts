interface RateLimitInfo {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitInfo>();

export function rateLimit(ip: string, limit = 5, windowMs = 60 * 1000): { success: boolean; remaining: number } {
  const now = Date.now();
  let info = store.get(ip);

  if (!info || info.resetAt < now) {
    info = { count: 1, resetAt: now + windowMs };
    store.set(ip, info);
    return { success: true, remaining: limit - 1 };
  }

  info.count += 1;
  if (info.count > limit) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: limit - info.count };
}

// Cleanup store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, info] of store.entries()) {
    if (info.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000); // 5 mins

export function __resetStore() {
  if (process.env.NODE_ENV === "test") {
    store.clear();
  }
}
