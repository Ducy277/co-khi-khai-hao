import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uploadsDir = join(process.cwd(), "public", "uploads");
    const images: { url: string; mtime: number }[] = [];

    async function scanDir(dir: string, baseRoute: string) {
      try {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const res = join(dir, entry.name);
          if (entry.isDirectory()) {
            await scanDir(res, `${baseRoute}/${entry.name}`);
          } else {
            if (entry.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
              const fileStat = await stat(res);
              images.push({
                url: `${baseRoute}/${entry.name}`,
                mtime: fileStat.mtime.getTime(),
              });
            }
          }
        }
      } catch (err) {
        // Directory might not exist, skip
      }
    }

    await scanDir(uploadsDir, "/uploads");

    // Sort newest first
    images.sort((a, b) => b.mtime - a.mtime);

    return NextResponse.json({ images: images.map(i => i.url) });
  } catch (error) {
    console.error("Library fetch error:", error);
    return NextResponse.json({ error: "Lỗi lấy thư viện ảnh" }, { status: 500 });
  }
}
