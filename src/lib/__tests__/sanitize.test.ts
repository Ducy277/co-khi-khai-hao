import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../sanitize";

describe("sanitizeHtml", () => {
  it("should return empty string for falsy input", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("should preserve safe HTML tags", () => {
    const safeHtml = "<p>Hello <b>World</b></p>";
    expect(sanitizeHtml(safeHtml)).toBe(safeHtml);
  });

  it("should remove script tags", () => {
    const malicious = "<p>Safe</p><script>alert(1)</script>";
    expect(sanitizeHtml(malicious)).toBe("<p>Safe</p>");
  });

  it("should remove inline event handlers", () => {
    const malicious = "<img src=\"fake.jpg\" onerror=\"alert('XSS')\" />";
    expect(sanitizeHtml(malicious)).toBe('<img src="fake.jpg">');
  });

  it("should remove javascript: pseudo-protocol", () => {
    const malicious = "<a href=\"javascript:alert('XSS')\">Click me</a>";
    // DOMPurify removes the a tag completely if the href is javascript: by default
    expect(sanitizeHtml(malicious)).toBe("<a>Click me</a>");
  });
});
