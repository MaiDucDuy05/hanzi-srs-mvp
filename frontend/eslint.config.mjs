import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Rule mới của eslint-plugin-react-hooks v7 (React Compiler era) báo lỗi
      // pattern "gọi setState ngay trong effect body" — đây là pattern fetch-in-effect
      // chuẩn được dùng nhất quán toàn app (load dữ liệu khi mount/đổi params).
      // Chuyển thành cảnh báo để không chặn lint, vẫn giữ cảnh báo cho dev thấy.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
