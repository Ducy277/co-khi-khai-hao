import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      include: [
        "src/lib/rate-limit.ts",
        "src/lib/sanitize.ts",
        "src/lib/quote-cart.ts",
        "src/lib/search.ts",
        "src/lib/utils.ts"
      ],
      reporter: ["text", "lcov"],
      thresholds: {
        lines: 80,
        functions: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
