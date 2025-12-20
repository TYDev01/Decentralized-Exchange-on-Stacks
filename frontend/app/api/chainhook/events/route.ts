import { NextResponse } from "next/server";
import { readChainhookPayloads } from "@/lib/chainhook-store";

export async function GET() {
  const payloads = await readChainhookPayloads();
  return NextResponse.json({ payloads });
}

