import { Cl, cvToHex } from "@stacks/transactions";
import { describe, expect, it } from "vitest";
import {
  getLatestActions,
  summarizeChainhookPayloads,
} from "../frontend/lib/chainhook-events";

function buildContractLogPayload(action: string) {
  const tuple = Cl.tuple({
    action: Cl.stringAscii(action),
  });
  const hex = cvToHex(tuple);

  return {
    events: [
      {
        contract_log: {
          value: {
            hex,
            repr: tuple.toString(),
          },
        },
      },
    ],
  };
}

describe("chainhook event parsing", () => {
  it("summarizes actions from stored payloads", () => {
    const payloads = [
      {
        receivedAt: "2025-01-01T00:00:00.000Z",
        payload: buildContractLogPayload("create-pool"),
      },
      {
        receivedAt: "2025-01-01T00:05:00.000Z",
        payload: buildContractLogPayload("swap"),
      },
    ];

    const summary = summarizeChainhookPayloads(payloads);
    expect(summary).toMatchSnapshot();
    expect(getLatestActions(payloads, 2)).toEqual(["swap", "create-pool"]);
  });
});
