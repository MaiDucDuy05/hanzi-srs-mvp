import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chuyển tiếp /api/audio/* (nút phát âm FR-01) tới backend NestJS —
  // backend phục vụ file tĩnh từ AUDIO_STORAGE_DIR (module audio).
  async rewrites() {
    const api =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
    return [
      {
        source: "/api/audio/:path*",
        destination: `${api}/audio/:path*`,
      },
    ];
  },
};

export default nextConfig;
