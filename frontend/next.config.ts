import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Import .svg as React components (@svgr/webpack) — used by src/assets/svg/*.
  // Static SVGs under /public/assets are served as plain <img> URLs (no loader needed).
  // Docs: node_modules/next/dist/docs/.../turbopack.md
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  // Mọi call API đi cùng origin /api/v1 → proxy sang backend NestJS. Nhờ đó
  // cookie HttpOnly access_token (do backend set) được browser gửi tự động,
  // frontend không cần đọc/touch token (đã xoá interceptor gắn header).
  // /api/audio/* là nút phát âm FR-01 — backend phục vụ file tĩnh từ AUDIO_STORAGE_DIR.
  async rewrites() {
    const api =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${api}/:path*`,
      },
      {
        source: "/api/audio/:path*",
        destination: `${api}/audio/:path*`,
      },
    ];
  },
};

export default nextConfig;
