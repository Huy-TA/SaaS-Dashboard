import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Tắt chuyển console trình duyệt sang server khi dev: trên máy này nó tạo vòng lặp
  // log trình duyệt → .next/dev/logs → Turbopack biên dịch lại → trang tải lại → log tiếp.
  logging: { browserToTerminal: false },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
