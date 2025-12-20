import { hexToCV } from "@stacks/transactions";
import { StoredChainhookPayload } from "@/lib/chainhook-store";

type ChainhookSummary = {
  count: number;
  latestAction?: string;
  latestTimestamp?: string;
};

function extractEventList(payload: unknown): unknown[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;

  const directEvents = root.events;
  if (Array.isArray(directEvents)) return directEvents;

  const nestedPayload = root.payload;
  if (nestedPayload && typeof nestedPayload === "object") {
    const nestedEvents = (nestedPayload as Record<string, unknown>).events;
    if (Array.isArray(nestedEvents)) return nestedEvents;
  }

  return [];
}

function extractActionsFromPayload(payload: unknown): string[] {
  const events = extractEventList(payload);
  const actions: string[] = [];

  for (const event of events) {
    if (!event || typeof event !== "object") continue;
    const contractLog = (event as Record<string, unknown>).contract_log as
      | Record<string, unknown>
      | undefined;
    if (!contractLog) continue;

    const value = contractLog.value as Record<string, unknown> | undefined;
    const hex = value?.hex as string | undefined;
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
