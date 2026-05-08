import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit, __resetStore } from "../rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow the first request", () => {
    const result = rateLimit("192.168.1.1", 5, 1000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should block requests over the limit", () => {
    const ip = "192.168.1.2";
    for (let i = 0; i < 5; i++) {
      rateLimit(ip, 5, 1000);
    }
    const blocked = rateLimit(ip, 5, 1000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("should reset limit after window passes", () => {
    const ip = "192.168.1.3";
    for (let i = 0; i < 5; i++) {
      rateLimit(ip, 5, 1000);
    }
    
    // Fast forward time past the window
    vi.advanceTimersByTime(1001);
    
    const allowed = rateLimit(ip, 5, 1000);
    expect(allowed.success).toBe(true);
    expect(allowed.remaining).toBe(4);
  });

  it("should track limits independently per IP", () => {
    const ip1 = "192.168.1.4";
    const ip2 = "192.168.1.5";
    
    for (let i = 0; i < 5; i++) {
      rateLimit(ip1, 5, 1000);
    }
    
    expect(rateLimit(ip1, 5, 1000).success).toBe(false);
    expect(rateLimit(ip2, 5, 1000).success).toBe(true);
  });
});
