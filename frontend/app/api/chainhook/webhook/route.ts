import { NextResponse } from "next/server";
import { appendChainhookPayload } from "@/lib/chainhook-store";

export async function POST(request: Request) {
  const payload = await request.json();
  await appendChainhookPayload(payload);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
