import { NextRequest, NextResponse } from "next/server";
import { readChainhookPayloads } from "@/lib/chainhook-store";

export async function GET(request: NextRequest) {
  const payloads = await readChainhookPayloads();
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : payloads.length;
  const safeLimit = Number.isNaN(limit) ? payloads.length : Math.max(limit, 0);
  const sliced = payloads.slice(Math.max(payloads.length - safeLimit, 0));

  return NextResponse.json({ payloads: sliced });
}
