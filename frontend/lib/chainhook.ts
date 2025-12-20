import { ChainhookClient } from "@hirosystems/chainhooks-client";

type ChainhookConfig = {
  baseUrl: string;
  apiKey?: string;
};

type ContractLogHookInput = {
  contractId: string;
  callbackUrl: string;
  chain: "mainnet" | "testnet" | "devnet";
};

export function createChainhookClient(config: ChainhookConfig) {
  const client = new (ChainhookClient as unknown as {
    new (options: { baseUrl: string; apiKey?: string }): unknown;
  })({
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
  });

  return client as {
    register: (hook: unknown) => Promise<unknown>;
  };
}

export function buildContractLogHook(input: ContractLogHookInput) {
  return {
    name: `amm-${input.chain}-contract-logs`,
    version: 1,
    chain: input.chain,
    event_types: ["smart_contract_log"],
    contract_id: input.contractId,
    webhook_url: input.callbackUrl,
  };
}
