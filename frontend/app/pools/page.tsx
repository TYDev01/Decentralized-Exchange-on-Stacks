import { AddLiquidity } from "@/components/add-liquidity";
import { ChainhookRegister } from "@/components/chainhook-register";
import { CreatePool } from "@/components/create-pool";
import { PoolsList } from "@/components/pools";
import { RemoveLiquidity } from "@/components/remove-liquidity";
import { getAllPools } from "@/lib/amm";
import { readChainhookPayloads } from "@/lib/chainhook-store";
import {
  getLatestActionEntries,
  getLatestActions,
  summarizeChainhookPayloads,
} from "@/lib/chainhook-events";

export default async function Pools() {
  const allPools = await getAllPools();
  const chainhookPayloads = await readChainhookPayloads();
  const chainhookSummary = summarizeChainhookPayloads(chainhookPayloads);
  const latestActions = getLatestActions(chainhookPayloads);
  const latestActionEntries = getLatestActionEntries(chainhookPayloads);

  return (
    <main className="flex min-h-screen flex-col gap-8 p-24">
      <h1 className="text-3xl font-bold">Pools</h1>
      <div className="text-sm text-gray-400">
        Chainhook events: {chainhookSummary.count}
        {chainhookSummary.latestAction
          ? ` (latest: ${chainhookSummary.latestAction})`
          : ""}
      </div>
      {latestActions.length > 0 ? (
        <div className="text-xs text-gray-500">
          Recent actions: {latestActions.join(", ")}
        </div>
      ) : null}
      {latestActionEntries.length > 0 ? (
        <div className="text-xs text-gray-500">
          {latestActionEntries.map((entry, index) => (
            <div key={`${entry.action}-${entry.receivedAt}-${index}`}>
              {entry.action} · {new Date(entry.receivedAt).toLocaleString()}
            </div>
          ))}
        </div>
      ) : null}
      <ChainhookRegister />
      <PoolsList pools={allPools} />
      <hr />
      <div className="flex justify-center gap-8">
        <CreatePool />
        {allPools.length > 0 ? (
          <>
            <AddLiquidity pools={allPools} />
            <RemoveLiquidity pools={allPools} />
          </>
        ) : null}
      </div>
    </main>
  );
}
