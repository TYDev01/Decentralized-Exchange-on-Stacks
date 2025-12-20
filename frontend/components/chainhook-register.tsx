"use client";

import { useState } from "react";

export function ChainhookRegister() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

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

  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        type="button"
        onClick={registerHook}
        className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700"
        disabled={status === "loading"}
      >
        Register Chainhook
      </button>
      {message ? <span className="text-gray-300">{message}</span> : null}
    </div>
  );
}
