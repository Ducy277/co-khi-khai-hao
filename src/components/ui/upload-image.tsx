/**
 * UploadImage — dùng thay cho <Image> với ảnh từ /uploads/*.
 *
 * Lý do: Trong production (Docker standalone), thư mục /public/uploads
 * được mount qua Docker Volume, nên Next.js Image Optimizer không đọc
 * được file để optimize. Nginx đã được cấu hình serve /uploads/ trực tiếp.
 *
 * Component này set unoptimized=true tự động cho src bắt đầu bằng /uploads/,
 * giữ nguyên lazy loading, layout fill, srcset cho ảnh bên ngoài.
 */

import Image, { ImageProps } from "next/image";

type UploadImageProps = ImageProps;

export default function UploadImage({ src, ...props }: UploadImageProps) {
  const isUpload =
    typeof src === "string" && src.startsWith("/uploads/");

  return <Image src={src} unoptimized={isUpload} {...props} />;
}
