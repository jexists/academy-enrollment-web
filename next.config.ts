import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // 개발 모드 표시 버튼이 하단 탭을 가려서 끈다 (배포에는 원래 없음)
  devIndicators: false,
  partialPrefetching: true,
  // 이용약관은 학원 안내의 규정 묶음으로 옮겼다
  async redirects() {
    return [{ source: "/terms", destination: "/guide/terms", permanent: false }];
  },
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
