import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: 'My Closet — Tủ đồ AI & Gợi ý Trang phục Cá nhân',
    template: '%s | My Closet'
  },
  description: 'Số hóa tủ quần áo cá nhân, quản lý quần áo thông minh và tự động gợi ý phối đồ hàng ngày bằng trí tuệ nhân tạo (AI).',
  keywords: ['tủ quần áo online', 'quản lý tủ đồ', 'gợi ý phối đồ AI', 'phối đồ thông minh', 'closet manager', 'AI fashion'],
  authors: [{ name: 'My Closet Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'My Closet',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'My Closet — Tủ đồ AI & Gợi ý Trang phục',
    description: 'Số hóa tủ quần áo cá nhân và gợi ý trang phục thông minh hàng ngày.',
    type: 'website',
    locale: 'vi_VN',
  },
};

export const viewport: Viewport = {
  themeColor: '#fcfbf7', // Matches the Washi paper background color --background oklch
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("font-sans", geistSans.variable, geistMono.variable)}>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
