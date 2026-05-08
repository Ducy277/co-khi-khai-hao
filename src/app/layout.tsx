import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cokhikhaihao.vn";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: "%s | Cơ Khí Khải Hào",
    default: "Cơ Khí Khải Hào - Phụ Tùng Cơ Khí Chính Hãng",
  },
  description:
    "Cung cấp phụ tùng cơ khí chính hãng: ổ bi, bánh răng, bu lông, dây đai. Gia công cơ khí theo yêu cầu. Liên hệ báo giá ngay.",
  keywords: ["phụ tùng cơ khí", "ổ bi", "bánh răng", "bu lông", "gia công cơ khí", "khải hào"],
  openGraph: {
    title: "Cơ Khí Khải Hào - Phụ Tùng Cơ Khí Chính Hãng",
    description: "Cung cấp phụ tùng cơ khí chính hãng: ổ bi, bánh răng, bu lông, dây đai. Gia công cơ khí theo yêu cầu. Liên hệ báo giá ngay.",
    url: BASE_URL,
    siteName: "Cơ Khí Khải Hào",
    locale: "vi_VN",
    type: "website",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="vi" className={`${inter.variable} ${robotoMono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased text-slate-800 bg-slate-50">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
