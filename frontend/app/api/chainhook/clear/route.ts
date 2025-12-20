import { NextResponse } from "next/server";
import { clearChainhookPayloads } from "@/lib/chainhook-store";

export async function POST() {
  await clearChainhookPayloads();
  return NextResponse.json({ ok: true });
}
