import { NextResponse } from "next/server";
import {
  buildContractLogHook,
  createChainhookClient,
} from "@/lib/chainhook";

export async function POST() {
  const baseUrl = process.env.CHAINHOOK_URL;
  const apiKey = process.env.CHAINHOOK_API_KEY;
  const contractId = process.env.AMM_CONTRACT_ID;
  const callbackUrl = process.env.CHAINHOOK_CALLBACK_URL;
  const network = (process.env.CHAINHOOK_NETWORK ||
    "testnet") as "mainnet" | "testnet";

  if (!baseUrl || !contractId || !callbackUrl) {
    return NextResponse.json(
      { error: "Missing CHAINHOOK_URL, AMM_CONTRACT_ID, or CHAINHOOK_CALLBACK_URL" },
      { status: 400 }
    );
  }

  const client = createChainhookClient({ baseUrl, apiKey });
  const hook = buildContractLogHook({ contractId, callbackUrl, network });
  await client.registerChainhook(hook);

  return NextResponse.json({ ok: true });
}
