import { useEffect, useState } from "react";
import {
  connect,
  disconnect,
  isConnected,
  request,
  openContractCall
} from "@stacks/connect";
import { PostConditionMode } from "@stacks/transactions";
import { addLiquidity, createPool, removeLiquidity, swap, Pool } from "@/lib/amm";

const appDetails = {
  name: "Full Range AMM",
  icon: "https://cryptologos.cc/logos/stacks-stx-logo.png",
};

interface UserInfo {
  address: string;
  // perhaps other fields as needed
}

export function useStacks() {
  const [userData, setUserData] = useState<UserInfo | null>(null);

  async function connectWallet() {
    await connect();
    const res = await request("stx_getAddresses", {});
    const stxAddress = res.addresses.find(a => a.symbol === "STX")?.address;
    setUserData({ address: stxAddress! });
  }

  function disconnectWallet() {
    disconnect();
    setUserData(null);
  }

  async function handleCreatePool(token0: string, token1: string, fee: number) {
    if (!userData) throw new Error("User not connected");
    const options = await createPool(token0, token1, fee);
    await openContractCall({
      ...options,
      appDetails,
      onFinish: (data) => {
        window.alert("Sent create pool transaction");
        console.log(data);
      },
      postConditionMode: PostConditionMode.Allow,
    });
  }

  // swap, addLiquidity, removeLiquidity similarly...

  useEffect(() => {
    if (isConnected()) {
      request("stx_getAddresses", {}).then(res => {
        const stxAddress = res.addresses.find(a => a.symbol === "STX")?.address;
        setUserData({ address: stxAddress! });
      });
    }
  }, []);

  return {
    userData,
    connectWallet,
    disconnectWallet,
    handleCreatePool,
    handleSwap: async (pool: Pool, amount: number, zeroForOne: boolean) => {
      if (!userData) throw new Error("User not connected");
      const options = await swap(pool, amount, zeroForOne, 0);
      await openContractCall({
        ...options,
        appDetails,
        onFinish: (data) => {
          window.alert("Sent swap transaction");
          console.log(data);
        },
        postConditionMode: PostConditionMode.Allow,
      });
    },
    handleAddLiquidity: async (pool: Pool, amount0: number, amount1: number) => {
      if (!userData) throw new Error("User not connected");
      const options = await addLiquidity(pool, amount0, amount1);
      await openContractCall({
        ...options,
        appDetails,
        onFinish: (data) => {
          window.alert("Sent add liquidity transaction");
          console.log(data);
        },
        postConditionMode: PostConditionMode.Allow,
      });
    },
    handleRemoveLiquidity: async (pool: Pool, liquidity: number) => {
      if (!userData) throw new Error("User not connected");
      const options = await removeLiquidity(pool, liquidity, 0, 0);
      await openContractCall({
        ...options,
        appDetails,
        onFinish: (data) => {
          window.alert("Sent remove liquidity transaction");
          console.log(data);
        },
        postConditionMode: PostConditionMode.Allow,
      });
    },
  };
}
