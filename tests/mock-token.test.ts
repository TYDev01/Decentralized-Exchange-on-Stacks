
import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;

/*
  The test below is an example. To learn more, read the testing documentation here:
  https://docs.hiro.so/stacks/clarinet-js-sdk
*/

describe("example tests", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("rejects mint from non-owner", () => {
    const deployer = accounts.get("deployer")!;
    const alice = accounts.get("wallet_1")!;

    const mintResult = simnet.callPublicFn(
      "mock-token",
      "mint",
      [Cl.uint(100), Cl.principal(alice)],
      alice
    );

    expect(mintResult.result).toBeErr(Cl.uint(100));

    const ownerMint = simnet.callPublicFn(
      "mock-token",
      "mint",
      [Cl.uint(100), Cl.principal(alice)],
      deployer
    );

    expect(ownerMint.result).toBeOk(Cl.bool(true));
  });

  // it("shows an example", () => {
  //   const { result } = simnet.callReadOnlyFn("counter", "get-counter", [], address1);
  //   expect(result).toBeUint(0);
  // });
});
