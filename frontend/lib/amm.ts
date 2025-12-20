import { STACKS_TESTNET } from "@stacks/network";
import {
  boolCV,
  Cl,
  cvToHex,
  fetchCallReadOnlyFunction,
  hexToCV,
  bufferCV,
  principalCV,
  PrincipalCV,
  uintCV,
  UIntCV,
  BufferCV,
} from "@stacks/transactions";


// REPLACE THESE WITH YOUR OWN OR USE NEXT_PUBLIC_* ENV VARS
const AMM_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_AMM_CONTRACT_ADDRESS ||
  "ST2WAFNEQ6ZC5C57N59A2WKN2CEG1YQ34BJ9YDPYF";
const AMM_CONTRACT_NAME =
  process.env.NEXT_PUBLIC_AMM_CONTRACT_NAME || "amm";

const READ_ONLY_RETRIES = 2;
const READ_ONLY_RETRY_DELAY_MS = 400;

async function fetchReadOnlyWithRetry(
  options: Parameters<typeof fetchCallReadOnlyFunction>[0]
) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= READ_ONLY_RETRIES; attempt += 1) {
    try {
      return await fetchCallReadOnlyFunction(options);
    } catch (error) {
      lastError = error;
      if (attempt === READ_ONLY_RETRIES) break;
      await new Promise((resolve) => setTimeout(resolve, READ_ONLY_RETRY_DELAY_MS));
    }
  }
  throw lastError;
}
const AMM_CONTRACT_PRINCIPAL = `${AMM_CONTRACT_ADDRESS}.${AMM_CONTRACT_NAME}`;

type PoolCV = {
  "token-0": PrincipalCV;
  "token-1": PrincipalCV;
  fee: UIntCV;
  liquidity: UIntCV;
  "balance-0": UIntCV;
  "balance-1": UIntCV;
};

type PoolIndexEntryCV = {
  "pool-id": BufferCV;
};

export type Pool = {
  id: string;
  "token-0": string;
  "token-1": string;
  fee: number;
  liquidity: number;
  "balance-0": number;
  "balance-1": number;
};


// getAllPools
// Returns an array of Pool objects
export async function getAllPools() {
  const pools: Pool[] = [];

  let poolCountResult;
  try {
    poolCountResult = await fetchReadOnlyWithRetry({
      contractAddress: AMM_CONTRACT_ADDRESS,
      contractName: AMM_CONTRACT_NAME,
      functionName: "get-pool-count",
      functionArgs: [],
      senderAddress: AMM_CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown read-only error";
    if (message.includes("NoSuchContract")) {
      console.warn(
        `AMM contract not found: ${AMM_CONTRACT_PRINCIPAL}. ` +
          "Verify deployment and wait for confirmations."
      );
      return pools;
    }
    throw error;
  }

  if (poolCountResult.type !== "ok") return pools;
  if (poolCountResult.value.type !== "uint") return pools;

  const poolCount = parseInt(poolCountResult.value.value.toString());

  for (let index = 0; index < poolCount; index += 1) {
    const poolIdEntryResult = await fetchReadOnlyWithRetry({
      contractAddress: AMM_CONTRACT_ADDRESS,
      contractName: AMM_CONTRACT_NAME,
      functionName: "get-pool-id-by-index",
      functionArgs: [uintCV(index)],
      senderAddress: AMM_CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    if (poolIdEntryResult.type !== "ok") continue;
    if (poolIdEntryResult.value.type !== "some") continue;
    if (poolIdEntryResult.value.value.type !== "tuple") continue;

    const poolIdEntry = poolIdEntryResult.value.value.value as PoolIndexEntryCV;
    const poolIdCv = poolIdEntry["pool-id"];

    const poolDataResult = await fetchReadOnlyWithRetry({
      contractAddress: AMM_CONTRACT_ADDRESS,
      contractName: AMM_CONTRACT_NAME,
      functionName: "get-pool-data",
      functionArgs: [poolIdCv],
      senderAddress: AMM_CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    if (poolDataResult.type !== "ok") continue;
    if (poolDataResult.value.type !== "some") continue;
    if (poolDataResult.value.value.type !== "tuple") continue;

    const poolData = poolDataResult.value.value.value as PoolCV;
    const poolIdHex = poolIdCv.value.toString("hex");

    const pool: Pool = {
      id: poolIdHex,
      "token-0": poolData["token-0"].value,
      "token-1": poolData["token-1"].value,
      fee: parseInt(poolData["fee"].value.toString()),
      liquidity: parseInt(poolData["liquidity"].value.toString()),
      "balance-0": parseInt(poolData["balance-0"].value.toString()),
      "balance-1": parseInt(poolData["balance-1"].value.toString()),
    };

    pools.push(pool);
  }

  return pools;
}



export async function createPool(token0: string, token1: string, fee: number) {
  const token0Hex = cvToHex(principalCV(token0));
  const token1Hex = cvToHex(principalCV(token1));

  // Sort the tokens properly here
  if (token0Hex > token1Hex) {
    [token0, token1] = [token1, token0];
  }

  const txOptions = {
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "create-pool",
    functionArgs: [principalCV(token0), principalCV(token1), uintCV(fee)],
  };

  return txOptions;
}

export async function addLiquidity(
  pool: Pool,
  amount0: number,
  amount1: number
) {
  if (amount0 === 0 || amount1 === 0) {
    throw new Error("Cannot add liquidity with 0 amount");
  }

  // If this is not initial liquidity, we need to add amounts in a ratio of the price
  if (pool.liquidity > 0) {
    const poolRatio = pool["balance-0"] / pool["balance-1"];

    const idealAmount1 = Math.floor(amount0 / poolRatio);
    if (amount1 < idealAmount1) {
      throw new Error(
        `Cannot add liquidity in these amounts. You need to supply at least ${idealAmount1} ${
          pool["token-1"].split(".")[1]
        } along with ${amount0} ${pool["token-0"].split(".")[1]}`
      );
    }
  }

  const txOptions = {
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "add-liquidity",
    functionArgs: [
      principalCV(pool["token-0"]),
      principalCV(pool["token-1"]),
      uintCV(pool.fee),
      uintCV(amount0),
      uintCV(amount1),
      uintCV(0),
      uintCV(0),
    ],
  };

  return txOptions;
}

export async function removeLiquidity(
  pool: Pool,
  liquidity: number,
  minAmount0 = 0,
  minAmount1 = 0
) {
  const txOptions = {
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "remove-liquidity",
    functionArgs: [
      principalCV(pool["token-0"]),
      principalCV(pool["token-1"]),
      uintCV(pool.fee),
      uintCV(liquidity),
      uintCV(minAmount0),
      uintCV(minAmount1),
    ],
  };

  return txOptions;
}

export async function swap(
  pool: Pool,
  amount: number,
  zeroForOne: boolean,
  minOutput = 0
) {
  const txOptions = {
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "swap",
    functionArgs: [
      principalCV(pool["token-0"]),
      principalCV(pool["token-1"]),
      uintCV(pool.fee),
      uintCV(amount),
      boolCV(zeroForOne),
      uintCV(minOutput),
    ],
  };

  return txOptions;
}

export async function getUserLiquidity(pool: Pool, user: string) {
  const userLiquidityResult = await fetchCallReadOnlyFunction({
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "get-position-liquidity",
    functionArgs: [bufferCV(Buffer.from(pool.id, "hex")), principalCV(user)],
    senderAddress: AMM_CONTRACT_ADDRESS,
    network: STACKS_TESTNET,
  });

  if (userLiquidityResult.type !== "ok") return 0;
  if (userLiquidityResult.value.type !== "uint") return 0;
  return parseInt(userLiquidityResult.value.value.toString());
}
