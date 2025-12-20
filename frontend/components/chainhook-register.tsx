"use client";

import { useState } from "react";

export function ChainhookRegister() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [statusInfo, setStatusInfo] = useState<string | null>(null);
  const [listInfo, setListInfo] = useState<string | null>(null);
  const [clearInfo, setClearInfo] = useState<string | null>(null);

  async function registerHook() {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/chainhook/register", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data?.error || "Failed to register Chainhook");
        return;
      }

      setStatus("success");
      setMessage("Chainhook registered");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to register Chainhook"
      );
    }
  }

  async function fetchStatus() {
    setStatusInfo(null);
    try {
      const response = await fetch("/api/chainhook/status");
      const data = await response.json();
      if (!response.ok) {
        setStatusInfo(data?.error || "Failed to fetch status");
        return;
      }
      const version =
        data?.status?.version || data?.status?.data?.version || "unknown";
      setStatusInfo(`Status OK (version: ${version})`);
    } catch (error) {
      setStatusInfo(
        error instanceof Error ? error.message : "Failed to fetch status"
      );
    }
  }

  async function fetchChainhooks() {
    setListInfo(null);
    try {
      const response = await fetch("/api/chainhook/list");
      const data = await response.json();
      if (!response.ok) {
        setListInfo(data?.error || "Failed to fetch chainhooks");
        return;
      }
      const total = data?.chainhooks?.total ?? 0;
      const items = data?.chainhooks?.results ?? [];
      const firstName =
        items.length > 0 ? items[0]?.definition?.name || "unknown" : null;
      setListInfo(
        `Registered chainhooks: ${total}${
          firstName ? ` (first: ${firstName})` : ""
        }`
      );
    } catch (error) {
      setListInfo(
        error instanceof Error ? error.message : "Failed to fetch chainhooks"
      );
    }
  }

  async function clearEvents() {
    setClearInfo(null);
    try {
      const response = await fetch("/api/chainhook/clear", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setClearInfo(data?.error || "Failed to clear events");
        return;
      }
      setClearInfo("Cleared Chainhook events");
    } catch (error) {
      setClearInfo(
        error instanceof Error ? error.message : "Failed to clear events"
      );
    }
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={registerHook}
          className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700"
          disabled={status === "loading"}
        >
          Register Chainhook
        </button>
        <button
          type="button"
          onClick={fetchStatus}
          className="rounded-md bg-gray-700 px-3 py-2 text-white hover:bg-gray-600"
        >
          Check Status
        </button>
        <button
          type="button"
          onClick={fetchChainhooks}
          className="rounded-md bg-gray-700 px-3 py-2 text-white hover:bg-gray-600"
        >
          List Chainhooks
        </button>
        <button
          type="button"
          onClick={clearEvents}
          className="rounded-md bg-gray-700 px-3 py-2 text-white hover:bg-gray-600"
        >
          Clear Events
        </button>
        {message ? <span className="text-gray-300">{message}</span> : null}
      </div>
      {statusInfo ? <span className="text-gray-400">{statusInfo}</span> : null}
      {listInfo ? <span className="text-gray-400">{listInfo}</span> : null}
      {clearInfo ? <span className="text-gray-400">{clearInfo}</span> : null}
    </div>
  );
}
