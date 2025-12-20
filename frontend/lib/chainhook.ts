import {
  ChainhooksClient,
  ChainhookDefinition,
} from "@hirosystems/chainhooks-client";

type ChainhookConfig = {
  baseUrl: string;
  apiKey?: string;
};

type ContractLogHookInput = {
  contractId: string;
  callbackUrl: string;
  network: "mainnet" | "testnet";
};

export function createChainhookClient(config: ChainhookConfig) {
  const client = new ChainhooksClient({
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
  });

  return client;
}

export function buildContractLogHook(
  input: ContractLogHookInput
): ChainhookDefinition {
  return {
    name: `amm-${input.network}-contract-logs`,
    version: "1",
    chain: "stacks",
    network: input.network,
    filters: {
      events: [
        {
          type: "contract_log",
          contract_identifier: input.contractId,
        },
      ],
    },
    options: {
      decode_clarity_values: true,
    },
    action: {
      type: "http_post",
      url: input.callbackUrl,
    },
  };
}
