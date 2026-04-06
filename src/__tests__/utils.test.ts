import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn — className merger utility", () => {
  it("merge 2 class thường", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("class xung đột Tailwind → giữ class phía sau (override)", () => {
    // text-red-500 bị ghi đè bởi text-blue-500
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("class padding xung đột → giữ class sau", () => {
    expect(cn("p-4", "px-2")).toBe("p-4 px-2");
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("không crash khi có giá trị falsy (undefined, false, null)", () => {
    expect(() => cn("px-4", undefined, false as unknown as string, null as unknown as string)).not.toThrow();
    expect(cn("px-4", undefined, false as unknown as string)).toBe("px-4");
  });

  it("trả về chuỗi rỗng khi không có input", () => {
    expect(cn()).toBe("");
  });

  it("merge class từ object conditional (clsx syntax)", () => {
    const isActive = true;
    const result = cn("base-class", { "active-class": isActive, "inactive-class": !isActive });
    expect(result).toBe("base-class active-class");
  });

  it("không có khoảng trắng thừa", () => {
    const result = cn("  px-4  ", "  py-2  ");
    expect(result.trim()).toBe(result); // trim() không thay đổi gì
  });
});
