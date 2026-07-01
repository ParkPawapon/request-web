"use client";

import { StatusPill } from "@/shared/ui/status-pill";

import type { PetitionSummary } from "@/entities/request";

type RequestsTableProps = Readonly<{
  entityLabel?: string;
  errorMsg?: string;
  headerLabels?: Readonly<{
    date: string;
    details: string;
    status: string;
    title: string;
  }>;
  loading?: boolean;
  onClickDetails: (id: string) => void;
  onRetry?: () => void;
  rows: readonly PetitionSummary[];
  statusLabels?: Record<string, string>;
}>;

const DEFAULT_HEADERS = {
  date: "วัน/เดือน/ปี",
  details: "รายละเอียด",
  status: "สถานะ",
  title: "ประเภทคำร้อง",
};

export function RequestsTable({
  entityLabel = "คำร้อง",
  errorMsg = "",
  headerLabels = DEFAULT_HEADERS,
  loading = false,
  onClickDetails,
  onRetry,
  rows,
  statusLabels,
}: RequestsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="hidden grid-cols-12 bg-[var(--brand-700)] px-6 py-4 text-base font-semibold text-white md:grid lg:text-lg">
        <div className="col-span-3">{headerLabels.date}</div>
        <div className="col-span-3">{headerLabels.title}</div>
        <div className="col-span-3">{headerLabels.status}</div>
        <div className="col-span-3 text-right">{headerLabels.details}</div>
      </div>

      {errorMsg ? (
        <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50 px-6 py-3 text-sm text-rose-700">
          <span>{errorMsg}</span>
          {onRetry ? (
            <button
              className="rounded-lg border px-3 py-1.5 text-rose-700 hover:bg-rose-100"
              onClick={onRetry}
              type="button"
            >
              ลองใหม่
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="divide-y">
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : rows.length === 0 ? (
          <div className="px-6 py-12 text-center text-base text-gray-500">
            ยังไม่มี{entityLabel}
          </div>
        ) : (
          rows.map((row) => (
            <div
              className="group grid grid-cols-1 items-center gap-y-2 px-6 py-5 text-sm transition-colors hover:bg-[var(--brand-50)]/40 md:grid-cols-12 lg:text-base"
              key={row.id}
            >
              <div className="text-gray-700 md:col-span-3">
                {formatDate(row.createdAt)}
              </div>
              <div
                className="truncate font-medium text-gray-900 md:col-span-3"
                title={row.title}
              >
                {row.title || "—"}
              </div>
              <div className="md:col-span-3">
                <StatusPill labels={statusLabels} status={row.status} />
              </div>
              <div className="md:col-span-3 md:text-right">
                <button
                  aria-label={`ดูรายละเอียด${entityLabel} #${row.id}`}
                  className="inline-flex items-center rounded-lg border border-[var(--brand-200)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-700)] transition hover:border-[var(--brand-300)] hover:bg-[var(--brand-50)] lg:text-base"
                  onClick={() => onClickDetails(row.id)}
                  type="button"
                >
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid animate-pulse grid-cols-12 gap-2 px-6 py-5">
      <div className="col-span-3 h-5 rounded bg-gray-100" />
      <div className="col-span-3 h-5 rounded bg-gray-100" />
      <div className="col-span-3 h-5 rounded bg-gray-100" />
      <div className="col-span-3 h-9 rounded bg-gray-100" />
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString("th-TH") : "—";
}
