import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Optional folder param: "products" | "content" | ...
    const folderParam = (formData.get("folder") as string) || "products";
    const safeFolder = folderParam.replace(/[^a-zA-Z0-9_-]/g, "") || "products";

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    // Validation: Check file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File quá lớn. Tối đa 5MB." }, { status: 400 });
    }

    // Validation: Check MIME type
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Định dạng file không được hỗ trợ. Chỉ chấp nhận JPG, PNG, WEBP, GIF." }, { status: 400 });
    }

    // Validation: Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || "";
    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json({ error: "Phần mở rộng file không hợp lệ." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename based on timestamp and original name
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, ""); // Remove special characters
    const filename = `${timestamp}-${sanitizedName}`;

    // Define upload path using the requested sub-folder
    const uploadDir = join(process.cwd(), "public", "uploads", safeFolder);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Returns the relative URL for public access
    const fileUrl = `/uploads/${safeFolder}/${filename}`;

    return NextResponse.json({ url: fileUrl, success: true });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Something went wrong during upload." }, { status: 500 });
  }
}
