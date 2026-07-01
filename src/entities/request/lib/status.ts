import type { NormalizedStatus, RequestRole } from "../model/types";

export const STATUS_LABELS_TH: Record<Exclude<NormalizedStatus, "unknown">, string> =
  {
    approved: "คำร้องได้รับการอนุมัติ",
    cancelled: "ยกเลิกคำร้องสำเร็จ",
    processing: "อยู่ระหว่างการดำเนินการ",
    rejected: "ถูกยกเลิกคำร้อง (ตีกลับ)",
    submitted: "การยื่นคำร้องเสร็จสิ้น",
  };

export const LECTURER_STATUS_LABELS: Record<
  Exclude<NormalizedStatus, "unknown">,
  string
> = {
  approved: "คำขอได้รับการอนุมัติ",
  cancelled: "ยกเลิกคำขอสำเร็จ",
  processing: "อยู่ระหว่างการดำเนินการ",
  rejected: "ถูกยกเลิกคำขอ (ตีกลับ)",
  submitted: "การยื่นคำขอเสร็จสิ้น",
};

export function normalizeStatus(status: unknown): NormalizedStatus {
  const text = String(status ?? "").trim().toLowerCase();
  if (!text) return "unknown";
  if (text.includes("อนุมัติ")) return "approved";
  if (text.includes("อยู่ระหว่าง") || text.includes("กำลัง")) return "processing";
  if (text.includes("เสร็จสิ้น")) return "submitted";
  if (text.includes("ตีกลับ") || text.includes("ถูกยกเลิก")) return "rejected";
  if (text.includes("ยกเลิก")) return "cancelled";
  return "unknown";
}

export function getEntityLabel(role: RequestRole): string {
  return role === "lecturer" ? "คำขอ" : "คำร้อง";
}

export function getTypeLabel(role: RequestRole): string {
  return role === "lecturer" ? "ประเภทคำขอ" : "ประเภทคำร้อง";
}

export function getStatusLabels(
  role: RequestRole,
): Record<Exclude<NormalizedStatus, "unknown">, string> {
  return role === "lecturer" ? LECTURER_STATUS_LABELS : STATUS_LABELS_TH;
}

export function formatDisplayTextForRole(text: unknown, role: RequestRole): string {
  const value = String(text ?? "");
  return role === "lecturer" ? value.replace(/คำร้อง/g, "คำขอ") : value;
}
