/**
 * Thin root layout required by Next.js.
 *
 * All localized routes live under `[locale]/layout.tsx`, which provides the
 * `<html>` and `<body>` tags. This file exists only because Next.js mandates
 * a root layout — it just forwards children to the localized layout below.
 *
 * See: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
