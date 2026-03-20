import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Providers } from "@/components/providers";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Cơ Khí Khải Hào",
    default: "Cơ Khí Khải Hào - Phụ Tùng Cơ Khí Chính Hãng",
  },
  description:
    "Cung cấp phụ tùng cơ khí chính hãng: ổ bi, bánh răng, bu lông, dây đai. Gia công cơ khí theo yêu cầu. Liên hệ báo giá ngay.",
  keywords: ["phụ tùng cơ khí", "ổ bi", "bánh răng", "bu lông", "gia công cơ khí", "khải hào"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[var(--font-be-vietnam)]">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
