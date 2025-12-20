import { NextResponse } from "next/server";
import { CHAINHOOKS_BASE_URL } from "@hirosystems/chainhooks-client";
import { createChainhookClient } from "@/lib/chainhook";

export async function GET() {
  const network = (process.env.CHAINHOOK_NETWORK ||
    "testnet") as "mainnet" | "testnet";
  const baseUrl =
    process.env.CHAINHOOK_URL || CHAINHOOKS_BASE_URL[network];
  const apiKey = process.env.CHAINHOOK_API_KEY;

  const client = createChainhookClient({ baseUrl, apiKey });
  const chainhooks = await client.getChainhooks({ limit: 50, offset: 0 });

  return NextResponse.json({ chainhooks });
}
