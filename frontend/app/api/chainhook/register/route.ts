import { NextResponse } from "next/server";
import {
  buildContractLogHook,
  createChainhookClient,
} from "@/lib/chainhook";
import { CHAINHOOKS_BASE_URL } from "@hirosystems/chainhooks-client";

export async function POST() {
  const network = (process.env.CHAINHOOK_NETWORK ||
    "testnet") as "mainnet" | "testnet";
  const baseUrl =
    process.env.CHAINHOOK_URL || CHAINHOOKS_BASE_URL[network];
  const apiKey = process.env.CHAINHOOK_API_KEY;
  const contractId = process.env.AMM_CONTRACT_ID;
  const callbackUrl = process.env.CHAINHOOK_CALLBACK_URL;

  if (!baseUrl || !contractId || !callbackUrl) {
    return NextResponse.json(
      { error: "Missing AMM_CONTRACT_ID or CHAINHOOK_CALLBACK_URL" },
      { status: 400 }
    );
  }

  const client = createChainhookClient({ baseUrl, apiKey });
  const hook = buildContractLogHook({ contractId, callbackUrl, network });
  await client.registerChainhook(hook);

  return NextResponse.json({ ok: true });
}
