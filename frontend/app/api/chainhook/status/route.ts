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
  const status = await client.getStatus();

  return NextResponse.json({ status });
}
