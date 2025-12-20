import { readChainhookPayloads } from "@/lib/chainhook-store";
import {
  getLatestActionEntries,
  summarizeChainhookPayloads,
} from "@/lib/chainhook-events";
import { ChainhookRegister } from "@/components/chainhook-register";

export default async function ChainhookPage() {
  const payloads = await readChainhookPayloads();
  const summary = summarizeChainhookPayloads(payloads);
  const latestActions = getLatestActionEntries(payloads, 10);
  const latestPayloads = payloads.slice(-5).reverse();

  return (
    <main className="flex min-h-screen flex-col gap-6 p-24">
      <h1 className="text-3xl font-bold">Chainhook</h1>
      <div className="text-sm text-gray-400">
        Events stored: {summary.count}
      </div>
      <ChainhookRegister />
      {latestActions.length > 0 ? (
        <div className="text-sm text-gray-300">
          <div className="font-semibold text-gray-200">Latest Actions</div>
          {latestActions.map((entry, index) => (
            <div key={`${entry.action}-${entry.receivedAt}-${index}`}>
              {entry.action} · {new Date(entry.receivedAt).toLocaleString()}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-400">No Chainhook events yet.</div>
      )}
      <div className="text-sm text-gray-300">
        <div className="font-semibold text-gray-200">Latest Payloads</div>
        {latestPayloads.length === 0 ? (
          <div className="text-gray-400">No payloads stored.</div>
        ) : (
          latestPayloads.map((entry, index) => (
            <pre
              key={`${entry.receivedAt}-${index}`}
              className="whitespace-pre-wrap rounded-md border border-gray-700 bg-gray-900 p-4 text-xs text-gray-200"
            >
              {JSON.stringify(entry, null, 2)}
            </pre>
          ))
        )}
      </div>
    </main>
  );
}
