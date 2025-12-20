import { promises as fs } from "fs";
import path from "path";

const STORE_DIR = path.join(process.cwd(), ".chainhook");
const STORE_FILE = path.join(STORE_DIR, "contract-logs.json");

export type StoredChainhookPayload = {
  receivedAt: string;
  payload: unknown;
};

async function ensureStoreDir() {
  await fs.mkdir(STORE_DIR, { recursive: true });
}

export async function appendChainhookPayload(payload: unknown) {
  await ensureStoreDir();

  const entry: StoredChainhookPayload = {
    receivedAt: new Date().toISOString(),
    payload,
  };

  let existing: StoredChainhookPayload[] = [];
  try {
    const content = await fs.readFile(STORE_FILE, "utf8");
    existing = JSON.parse(content) as StoredChainhookPayload[];
  } catch {
    existing = [];
  }

  existing.push(entry);
  await fs.writeFile(STORE_FILE, JSON.stringify(existing, null, 2), "utf8");
}

export async function readChainhookPayloads() {
  try {
    const content = await fs.readFile(STORE_FILE, "utf8");
    return JSON.parse(content) as StoredChainhookPayload[];
  } catch {
    return [];
  }
}
