import type {
  PetitionAttachment,
  PetitionDetail,
  PetitionSummary,
  StaffRoleView,
} from "../model/types";

export function safeDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = new Date(String(value));
  if (!Number.isFinite(date.getTime()) || date.getTime() === 0) {
    return null;
  }

  return date;
}

export function formatDate(value: unknown): string {
  return safeDate(value)?.toLocaleDateString("th-TH") ?? "—";
}

export function formatDateTime(value: unknown): string {
  const date = safeDate(value);
  if (!date) return "—";
  return `${date.toLocaleDateString("th-TH")} ${date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function formatBytes(value: unknown): string {
  const bytes = Number(value ?? 0);
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"] as const;
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
}

export function normalizePetitionSummary(input: unknown): PetitionSummary | null {
  if (!isRecord(input)) return null;

  const id =
    readText(input["id"]) ??
    readText(input["petitionID"]) ??
    readText(input["petitionId"]) ??
    readText(input["requestID"]) ??
    readText(input["requestId"]);

  if (!id) return null;

  const title =
    readText(input["titleName"]) ??
    readText(input["title"]) ??
    readText(input["petitionTypeName"]) ??
    readText(input["typeName"]) ??
    readText(input["name"]) ??
    "—";

  const status =
    readText(input["status"]) ??
    readText(input["overallStatus"]) ??
    readText(input["currentStage"]) ??
    readText(input["stage"]) ??
    "กำลังตรวจสอบ";

  const createdAt =
    safeDate(
      input["createdAt"] ??
        input["submittedAt"] ??
        input["created_at"] ??
        input["updatedAt"] ??
        input["date"],
    )?.toISOString() ?? null;

  const summary: {
    createdAt: string | null;
    fullName?: string;
    id: string;
    status: string;
    submittedType?: StaffRoleView;
    title: string;
  } = {
    createdAt,
    id,
    status,
    title,
  };

  const fullName =
    readText(input["submittedByName"]) ??
    readText(input["requesterName"]) ??
    readText(input["fullName"]) ??
    readFullName(input);
  if (fullName) {
    summary.fullName = fullName;
  }

  const submittedType = normalizeStaffRoleView(
    input["submittedType"] ?? input["requesterRole"],
  );
  if (submittedType) {
    summary.submittedType = submittedType;
  }

  return summary;
}

export function normalizePetitionDetail(input: unknown): PetitionDetail | null {
  if (!isRecord(input)) return null;
  return input as PetitionDetail;
}

export function normalizeAttachment(input: unknown): PetitionAttachment | null {
  if (!isRecord(input)) return null;
  return input as PetitionAttachment;
}

export function readText(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text ? text : undefined;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readFullName(input: Record<string, unknown>): string | undefined {
  const firstName = readText(input["firstName"]);
  const lastName = readText(input["lastName"]);
  if (!firstName && !lastName) return undefined;
  return `${firstName ?? ""}${lastName ? ` ${lastName}` : ""}`.trim();
}

function normalizeStaffRoleView(value: unknown): StaffRoleView | undefined {
  const text = String(value ?? "").toLowerCase();
  if (text === "lecturer" || text === "student") {
    return text;
  }
  return undefined;
}
