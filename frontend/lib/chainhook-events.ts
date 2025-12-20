import { hexToCV } from "@stacks/transactions";
import { StoredChainhookPayload } from "@/lib/chainhook-store";

type ChainhookSummary = {
  count: number;
  latestAction?: string;
  latestTimestamp?: string;
};

type ContractLogValue = {
  hex?: string;
  repr?: string;
  raw?: string;
};

function collectContractLogValues(payload: unknown): ContractLogValue[] {
  const results: ContractLogValue[] = [];
  const queue: unknown[] = [payload];

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current || typeof current !== "object") continue;

    if (Array.isArray(current)) {
      for (const item of current) queue.push(item);
      continue;
    }

    const record = current as Record<string, unknown>;
    const contractLog = record.contract_log as Record<string, unknown> | undefined;
    if (contractLog) {
      const value = contractLog.value as Record<string, unknown> | string | undefined;
      if (value && typeof value === "object") {
        results.push({
          hex: value.hex as string | undefined,
          repr: value.repr as string | undefined,
        });
      } else if (typeof value === "string") {
        results.push({ raw: value });
      }
    }

    if (record.type === "contract_log") {
      const metadata = record.metadata as Record<string, unknown> | undefined;
      const value = metadata?.value as Record<string, unknown> | string | undefined;
      if (value && typeof value === "object") {
        results.push({
          hex: value.hex as string | undefined,
          repr: value.repr as string | undefined,
        });
      } else if (typeof value === "string") {
        results.push({ raw: value });
      }
    }

    for (const value of Object.values(record)) {
      queue.push(value);
    }
  }

  return results;
}

function extractActionsFromPayload(payload: unknown): string[] {
  const values = collectContractLogValues(payload);
  const actions: string[] = [];

  for (const value of values) {
    const hex = value.hex || (value.raw?.startsWith("0x") ? value.raw : undefined);
    if (!hex) continue;

    const cv = hexToCV(hex);
    if (cv.type !== "tuple") continue;
    const action = cv.value["action"];
    if (!action || action.type !== "ascii") continue;
    actions.push(action.value);
  }

  return actions;
}

export function summarizeChainhookPayloads(
  payloads: StoredChainhookPayload[]
): ChainhookSummary {
  const count = payloads.length;
  if (count === 0) return { count };

  const latest = payloads[count - 1];
  const actions = extractActionsFromPayload(latest.payload);

  return {
    count,
    latestAction: actions[actions.length - 1],
    latestTimestamp: latest.receivedAt,
  };
}

export function getLatestActions(
  payloads: StoredChainhookPayload[],
  limit = 5
) {
  const actions: string[] = [];

  for (let i = payloads.length - 1; i >= 0 && actions.length < limit; i -= 1) {
    const payloadActions = extractActionsFromPayload(payloads[i].payload);
    for (let j = payloadActions.length - 1; j >= 0; j -= 1) {
      actions.push(payloadActions[j]);
      if (actions.length >= limit) break;
    }
  }

  return actions;
}
