import type { Metadata } from "next";
import { Geist_Mono, Inter, Poppins, Nunito } from "next/font/google";
import { AuthProvider } from "@/lib/auth/auth-context";
import { AppShell } from "@/features/layout/components/app-shell";
import "./globals.css";

const poppins = Poppins({
 variable: "--font-poppins",
 subsets: ["latin"],
 weight: ["400", "500", "600", "700", "800"],
 display: "swap",
});

const nunito = Nunito({
 variable: "--font-nunito",
 subsets: ["latin"],
 weight: ["600", "700", "800", "900"],
 display: "swap",
});

const inter = Inter({
 variable: "--font-inter",
 subsets: ["latin"],
 display: "swap",
});

const geistMono = Geist_Mono({
 variable: "--font-geist-mono",
 subsets: ["latin"],
});

export const metadata: Metadata = {
 title: "Hán Tự HSK — Học tiếng Trung, luyện thi HSK",
 description:
 "Nền tảng học tiếng Trung và luyện thi HSK: học theo cấp độ, chủ đề, luyện tập, trò chơi và bài kiểm tra.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
 return (
 <html
 lang="vi"
 className={`${poppins.variable} ${inter.variable} ${geistMono.variable} ${nunito.variable} h-full antialiased`}
 >
 <body className="min-h-full flex flex-col">
 <AuthProvider>
 <AppShell>{children}</AppShell>
 </AuthProvider>
 </body>
 </html>
 );
}
