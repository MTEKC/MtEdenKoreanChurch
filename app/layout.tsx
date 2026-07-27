import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "마운트 이든 한인교회 | Mt Eden Korean Church",
  description: "뉴질랜드 마운트 이든 한인교회 예배 안내, 설교, 소식과 교회 자료실",
  icons: {
    icon: "/logo_high.png",
    shortcut: "/logo_high.png",
    apple: "/logo_high.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
