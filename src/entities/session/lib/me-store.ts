import type { SessionUser } from "../model/types";

const KEY = "app.me.v2";
const MAX_LEN = 256;
const DEFAULT_TTL_MS = 30 * 60 * 1000;

const ALLOWED_FIELDS = new Set([
  "branch",
  "department",
  "email",
  "faculty",
  "firstName",
  "id",
  "lastName",
  "name",
  "phone",
  "prefix",
  "role",
  "studentID",
]);

type StoragePayload = Readonly<{
  data: SessionUser;
  exp: number;
  v: "2";
}>;

export function getStoredMe(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    for (const type of ["sessionStorage", "localStorage"] as const) {
      const storage = getStorage(type);
      if (!storage) continue;

      const raw = storage.getItem(KEY);
      if (!raw) continue;

      const parsed = JSON.parse(raw) as unknown;
      if (!isStoragePayload(parsed)) continue;

      if (Date.now() > parsed.exp) {
        storage.removeItem(KEY);
        continue;
      }

      return sanitizeSessionUser(parsed.data);
    }
  } catch {
    return null;
  }

  return null;
}

export function setStoredMe(
  input: unknown,
  options: Readonly<{ persist?: boolean; ttlMs?: number }> = {},
): void {
  if (typeof window === "undefined") {
    return;
  }

  const safe = sanitizeSessionUser(input);
  if (!safe) {
    clearStoredMe();
    return;
  }

  const payload: StoragePayload = {
    data: safe,
    exp: Date.now() + Math.max(60_000, options.ttlMs ?? DEFAULT_TTL_MS),
    v: "2",
  };

  try {
    getStorage("sessionStorage")?.setItem(KEY, JSON.stringify(payload));
    const local = getStorage("localStorage");
    if (!local) return;

    if (options.persist) {
      local.setItem(KEY, JSON.stringify(payload));
    } else {
      local.removeItem(KEY);
    }
  } catch {
    clearStoredMe();
  }
}

export function clearStoredMe(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    getStorage("sessionStorage")?.removeItem(KEY);
    getStorage("localStorage")?.removeItem(KEY);
  } catch {
    // ignore storage failures
  }
}

export function sanitizeSessionUser(input: unknown): SessionUser | null {
  if (!isRecord(input)) {
    return null;
  }

  const out: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!ALLOWED_FIELDS.has(key)) continue;

    if (typeof value === "string") {
      const trimmed = value.trim().slice(0, MAX_LEN);
      if (trimmed) out[key] = trimmed;
      continue;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      out[key] = value;
      continue;
    }

    if (typeof value === "boolean") {
      out[key] = value;
    }
  }

  if (!out["id"] && !out["email"]) {
    return null;
  }

  return { ...out, id: String(out["id"] ?? out["email"]) };
}

export function formatFullName(me: SessionUser | null | undefined): string {
  if (!me) {
    return "ผู้ใช้";
  }

  const composed = `${me.prefix ?? ""}${me.firstName ?? ""}${
    me.lastName ? ` ${me.lastName}` : ""
  }`.trim();

  return composed || me.name || "ผู้ใช้";
}

function getStorage(type: "localStorage" | "sessionStorage"): Storage | null {
  try {
    const storage = window[type];
    const testKey = "__request_web_storage_test__";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

function isStoragePayload(value: unknown): value is StoragePayload {
  return (
    isRecord(value) &&
    value["v"] === "2" &&
    typeof value["exp"] === "number" &&
    isRecord(value["data"])
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
