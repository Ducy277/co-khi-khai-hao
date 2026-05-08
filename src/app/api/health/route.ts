import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus: "ok" | "error" = "error";
  let dbLatencyMs = -1;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = "ok";
  } catch (error) {
    dbStatus = "error";
  }

  const status = dbStatus === "ok" ? "healthy" : "degraded";
  const httpStatus = dbStatus === "ok" ? 200 : 503;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTimeMs: Date.now() - startTime,
      services: {
        database: { status: dbStatus, latencyMs: dbLatencyMs },
      },
    },
    { status: httpStatus }
  );
}
