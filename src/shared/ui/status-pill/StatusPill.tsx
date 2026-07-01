import {
  Ban,
  CheckCircle2,
  Clock,
  HelpCircle,
  XCircle,
  type LucideIcon,
} from "lucide-react";

type StatusPillProps = Readonly<{
  className?: string;
  labels?: Partial<Record<NormalizedStatus, string>> | undefined;
  size?: "md" | "sm";
  status: unknown;
  withIcon?: boolean;
}>;

export type NormalizedStatus =
  | "approved"
  | "cancelled"
  | "processing"
  | "rejected"
  | "submitted"
  | "unknown";

type StatusMeta = Readonly<{
  Icon: LucideIcon;
  className: string;
  label: string;
}>;

const STATUS_LABELS_TH: Record<Exclude<NormalizedStatus, "unknown">, string> = {
  approved: "คำร้องได้รับการอนุมัติ",
  cancelled: "ยกเลิกคำร้องสำเร็จ",
  processing: "อยู่ระหว่างการดำเนินการ",
  rejected: "ถูกยกเลิกคำร้อง (ตีกลับ)",
  submitted: "การยื่นคำร้องเสร็จสิ้น",
};

export function StatusPill({
  className = "",
  labels,
  size = "sm",
  status,
  withIcon = true,
}: StatusPillProps) {
  const meta = getStatusMeta(status, labels);
  const Icon = meta.Icon;
  const sizeClass =
    size === "md" ? "px-3.5 py-1.5 text-sm" : "px-3 py-1 text-xs";

  return (
    <span
      aria-label={meta.label}
      className={[
        "inline-flex items-center gap-2 rounded-full border font-semibold ring-1",
        sizeClass,
        meta.className,
        className,
      ].join(" ")}
      title={meta.label}
    >
      {withIcon ? (
        <Icon
          aria-hidden="true"
          className="shrink-0 opacity-90"
          size={size === "md" ? 16 : 14}
        />
      ) : null}
      <span>{meta.label}</span>
    </span>
  );
}

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

function getStatusMeta(
  status: unknown,
  labels: Partial<Record<NormalizedStatus, string>> | undefined,
): StatusMeta {
  const key = normalizeStatus(status);
  const defaultLabel =
    key === "unknown"
      ? String(status || "ไม่ทราบสถานะ")
      : STATUS_LABELS_TH[key];
  const label = labels?.[key] ?? defaultLabel;

  switch (key) {
    case "submitted":
      return {
        Icon: CheckCircle2,
        className: "border-sky-200 bg-sky-50 text-sky-700 ring-sky-100",
        label,
      };
    case "processing":
      return {
        Icon: Clock,
        className: "border-amber-200 bg-amber-50 text-amber-700 ring-amber-100",
        label,
      };
    case "approved":
      return {
        Icon: CheckCircle2,
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-100",
        label,
      };
    case "cancelled":
      return {
        Icon: Ban,
        className: "border-gray-200 bg-gray-50 text-gray-700 ring-gray-100",
        label,
      };
    case "rejected":
      return {
        Icon: XCircle,
        className: "border-rose-200 bg-rose-50 text-rose-700 ring-rose-100",
        label,
      };
    case "unknown":
      return {
        Icon: HelpCircle,
        className: "border-gray-200 bg-gray-50 text-gray-600 ring-gray-100",
        label,
      };
  }
}
