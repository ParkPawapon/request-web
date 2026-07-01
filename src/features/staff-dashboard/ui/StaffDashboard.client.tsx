"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import {
  listStaffDashboard,
  listStaffRequests,
  type PetitionSummary,
  type StaffDashboardKpi,
  type StaffDashboardRow,
  type StaffDashboardTrendPoint,
  type StaffRoleView,
} from "@/entities/request";
import { useSession } from "@/entities/session/lib/session-context.client";
import { StatusPill } from "@/shared/ui/status-pill";

const STATUS_LABEL_TH = {
  approved: "คำร้องได้รับการอนุมัติ",
  processing: "อยู่ระหว่างการดำเนินการ",
  rejected: "ถูกยกเลิกคำร้อง (ตีกลับ)",
  submitted: "การยื่นคำร้องเสร็จสิ้น",
} as const;

const STATUS_ROUTE = {
  approved: "คำร้องได้รับการอนุมัติ",
  pending: "อยู่ระหว่างการดำเนินการ",
  rejected: "ถูกยกเลิกคำร้อง (ตีกลับ)",
  submitted: "การยื่นคำร้องเสร็จสิ้น",
} as const;

export function StaffDashboard() {
  const router = useRouter();
  const { logout } = useSession();
  const [roleView, setRoleView] = useState<StaffRoleView>("all");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "status">("latest");
  const [pageSize, setPageSize] = useState<10 | 25 | 50>(10);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<readonly StaffDashboardRow[]>([]);
  const [kpi, setKpi] = useState<StaffDashboardKpi>(emptyKpi);
  const [last7, setLast7] = useState<readonly StaffDashboardTrendPoint[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function loadDashboard() {
      setLoading(true);
      setErrMsg("");
      try {
        const response = await listStaffDashboard(
          { page, pageSize, roleView, sortBy, status: "all" },
          controller.signal,
        );
        if (!alive) return;
        setRows(response.data ?? []);
        setKpi(response.kpi ?? emptyKpi);
        setLast7(response.last7 ?? []);
        setMeta(response.meta ?? { page, pageSize, total: 0, totalPages: 1 });
      } catch (error) {
        if (!alive) return;
        if (isUnauthorized(error)) {
          await logout();
          return;
        }
        setRows([]);
        setKpi(emptyKpi);
        setLast7([]);
        setMeta({ page: 1, pageSize, total: 0, totalPages: 1 });
        setErrMsg("ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์ได้");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [logout, page, pageSize, roleView, sortBy]);

  const totalPages = Math.max(1, meta.totalPages);
  const pageSafe = Math.min(Math.max(1, page), totalPages);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            แดชบอร์ดเจ้าหน้าที่
          </h1>
          <p className="text-sm text-gray-500">
            ภาพรวมคำร้องทั้งหมดในระบบ แยกตามบทบาทผู้ยื่น
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Segmented
            value={roleView}
            onChange={(nextRoleView) => {
              setRoleView(nextRoleView);
              setPage(1);
            }}
          />
          <label className="inline-flex items-center gap-2 text-sm text-gray-600">
            จัดเรียง:
            <select
              className="rounded-lg border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-300)]"
              onChange={(event) => {
                setSortBy(event.target.value as typeof sortBy);
                setPage(1);
              }}
              value={sortBy}
            >
              <option value="latest">ล่าสุดก่อน</option>
              <option value="oldest">เก่าสุดก่อน</option>
              <option value="status">ตามสถานะ</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-600">
            แสดงต่อหน้า:
            <select
              className="rounded-lg border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-300)]"
              onChange={(event) => {
                setPageSize(Number(event.target.value) as 10 | 25 | 50);
                setPage(1);
              }}
              value={pageSize}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      </div>

      {errMsg ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errMsg}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <KPIBox title="คำร้องทั้งหมด" value={kpi.total} />
        <KPIBox title={STATUS_LABEL_TH.submitted} value={kpi.submitted} />
        <KPIBox title={STATUS_LABEL_TH.processing} value={kpi.processing} />
        <KPIBox title={STATUS_LABEL_TH.approved} value={kpi.approved} />
        <KPIBox title={STATUS_LABEL_TH.rejected} value={kpi.rejected} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-3">
        <Card className="p-4 sm:p-5 lg:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
              ปริมาณคำร้อง 7 วันล่าสุด
            </h2>
            <span className="text-xs text-gray-500 sm:text-sm">
              {loading ? "กำลังโหลด…" : "อัปเดตล่าสุด"}
            </span>
          </div>
          <MiniBar data={last7} />
        </Card>

        <Card className="p-4 sm:p-5">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
            สัดส่วนตามสถานะ
          </h2>
          <div className="mt-3 space-y-2 sm:mt-4">
            {(["submitted", "processing", "approved", "rejected"] as const).map(
              (status) => {
                const count = kpi[status];
                const percent = kpi.total ? Math.round((count / kpi.total) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <StatusPill status={STATUS_LABEL_TH[status]} />
                      <span className="text-gray-500">
                        {count} • {percent}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-2 ${statusBarBg(status)}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden sm:mt-6">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
            รายการล่าสุด
          </h2>
          <div className="text-xs text-gray-500 sm:text-sm">
            มุมมอง:{" "}
            <span className="font-medium text-gray-700">
              {roleView === "all" ? "ทั้งหมด" : roleLabel(roleView)}
            </span>{" "}
            • {meta.total} รายการ
          </div>
        </div>

        <div className="divide-y">
          {loading ? (
            <>
              <TableSkeleton />
              <TableSkeleton />
              <TableSkeleton />
            </>
          ) : rows.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-500">ไม่มีข้อมูล</div>
          ) : (
            rows.map((row) => (
              <div
                className="grid grid-cols-1 gap-2 px-4 py-4 text-sm hover:bg-[var(--brand-50)]/40 md:grid-cols-12 md:items-center sm:px-5"
                key={row.id}
              >
                <div className="md:col-span-2">{formatDate(row.createdAt)}</div>
                <div className="truncate font-medium text-gray-900 md:col-span-4">
                  {row.title || "—"}
                </div>
                <div className="text-gray-700 md:col-span-3">
                  {row.requesterName || "—"} • {roleLabel(row.requesterRole)}
                </div>
                <div className="md:col-span-2">
                  <StatusPill status={row.statusText || row.statusKey} />
                </div>
                <div className="md:col-span-1 md:text-right">
                  <button
                    className="rounded-lg border border-[var(--brand-200)] bg-white px-3 py-2 font-medium text-[var(--brand-700)] hover:bg-[var(--brand-50)]"
                    onClick={() => router.push(`/staff/request/${encodeURIComponent(row.id)}`)}
                    type="button"
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:px-5">
          <div className="text-xs text-gray-500 sm:text-sm">
            แสดง {meta.total ? (pageSafe - 1) * pageSize + 1 : 0}-
            {Math.min(pageSafe * pageSize, meta.total)} จาก {meta.total}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
              disabled={pageSafe <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              ก่อนหน้า
            </button>
            <span className="text-sm text-gray-600">
              {pageSafe} / {totalPages}
            </span>
            <button
              className="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
              disabled={pageSafe >= totalPages || loading}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              type="button"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </Card>
    </>
  );
}

export function StaffStatusRequestList({
  statusKey,
}: Readonly<{ statusKey: keyof typeof STATUS_ROUTE }>) {
  const router = useRouter();
  const { logout } = useSession();
  const statusFilter = STATUS_ROUTE[statusKey] ?? STATUS_ROUTE.submitted;
  const [rows, setRows] = useState<readonly PetitionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedType, setSubmittedType] = useState<StaffRoleView>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await listStaffRequests(
          {
            page: 1,
            pageSize: 50,
            q: query,
            status: statusFilter,
            submittedType,
          },
          controller.signal,
        );
        if (alive) setRows(data);
      } catch (error) {
        if (!alive) return;
        if (isUnauthorized(error)) {
          await logout();
          return;
        }
        setRows([]);
        setErrorMsg("เกิดข้อผิดพลาดในการโหลดรายการคำร้อง");
      } finally {
        if (alive) setLoading(false);
      }
    }, 400);

    return () => {
      alive = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [logout, query, statusFilter, submittedType]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ติดตามคำร้อง</h1>
          <p className="text-base text-gray-500">เฉพาะสถานะ “{statusFilter}”</p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          มุมมอง:
          <select
            className="rounded-lg border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-300)]"
            onChange={(event) => setSubmittedType(event.target.value as StaffRoleView)}
            value={submittedType}
          >
            <option value="all">ทั้งหมด</option>
            <option value="student">นักศึกษา</option>
            <option value="lecturer">อาจารย์</option>
          </select>
        </label>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <div className="text-xs text-gray-600 sm:text-sm">
            ค้นหา “ประเภทคำร้อง / หมายเหตุ / ชื่อผู้ยื่น”
          </div>
          <input
            aria-label="ช่องค้นหา"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-300)] sm:w-80"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="พิมพ์คำค้น เช่น ใบรับรอง, สมชาย..."
            value={query}
          />
        </div>

        {errorMsg ? (
          <div className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:px-6">
            {errorMsg}
          </div>
        ) : null}

        <div className="hidden grid-cols-12 bg-[var(--brand-700)] px-6 py-4 text-base font-semibold text-white md:grid">
          <div className="col-span-2">วัน/เดือน/ปี</div>
          <div className="col-span-4">ประเภทคำร้อง</div>
          <div className="col-span-3">ชื่อ-นามสกุล</div>
          <div className="col-span-2">สถานะ</div>
          <div className="col-span-1 text-right">รายละเอียด</div>
        </div>

        <div className="divide-y">
          {loading ? (
            <>
              <TableSkeleton />
              <TableSkeleton />
              <TableSkeleton />
            </>
          ) : rows.length === 0 ? (
            <div className="px-6 py-12 text-center text-base text-gray-500">
              ไม่พบข้อมูล
            </div>
          ) : (
            rows.map((row) => (
              <div
                className="grid grid-cols-1 gap-y-2 px-4 py-4 text-sm transition-colors hover:bg-[var(--brand-50)]/40 md:grid-cols-12 md:items-center sm:px-6 lg:text-[15px]"
                key={row.id}
              >
                <div className="text-gray-700 md:col-span-2">{formatDate(row.createdAt)}</div>
                <div className="truncate font-medium text-gray-900 md:col-span-4">
                  {row.title || "—"}
                </div>
                <div className="md:col-span-3">
                  <div className="truncate text-gray-900">{row.fullName || "—"}</div>
                  <div className="text-[12px] leading-tight text-gray-500">
                    ({roleLabel(row.submittedType)})
                  </div>
                </div>
                <div className="md:col-span-2">
                  <StatusPill status={row.status} />
                </div>
                <div className="md:col-span-1 md:text-right">
                  <button
                    aria-label={`ดูรายละเอียดคำร้อง #${row.id}`}
                    className="inline-flex items-center rounded-lg border border-[var(--brand-200)] bg-white px-3 py-2 font-medium text-[var(--brand-700)] transition hover:border-[var(--brand-300)] hover:bg-[var(--brand-50)]"
                    onClick={() => router.push(`/staff/request/${encodeURIComponent(row.id)}`)}
                    type="button"
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  );
}

const emptyKpi: StaffDashboardKpi = {
  approved: 0,
  processing: 0,
  rejected: 0,
  submitted: 0,
  total: 0,
};

function Card({
  children,
  className = "",
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 ${className}`}>
      {children}
    </div>
  );
}

function KPIBox({
  title,
  value,
}: Readonly<{ title: string; value: number }>) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="text-xs text-gray-500 sm:text-sm">{title}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
        {value}
      </div>
    </Card>
  );
}

function Segmented({
  onChange,
  value,
}: Readonly<{ onChange: (value: StaffRoleView) => void; value: StaffRoleView }>) {
  return (
    <div className="inline-flex rounded-xl bg-white p-1 ring-1 ring-gray-200">
      {[
        { key: "all", label: "ทั้งหมด" },
        { key: "student", label: "นักศึกษา" },
        { key: "lecturer", label: "อาจารย์" },
      ].map((option) => (
        <button
          aria-pressed={value === option.key}
          className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition sm:px-4 sm:py-2 ${
            value === option.key
              ? "bg-[var(--brand-50)] text-[var(--brand-700)]"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          key={option.key}
          onClick={() => onChange(option.key as StaffRoleView)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function MiniBar({ data }: Readonly<{ data: readonly StaffDashboardTrendPoint[] }>) {
  const counts = data.map((item) => item.count);
  const max = Math.max(1, ...counts);
  const sum = counts.reduce((acc, item) => acc + item, 0);
  const avg = Math.round((sum / (data.length || 1)) * 10) / 10;

  if (!data.length) {
    return <div className="mt-3 text-sm text-gray-500">ไม่มีข้อมูล</div>;
  }

  return (
    <div className="mt-3 sm:mt-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 sm:text-sm">
        <span>
          รวม 7 วัน: <span className="font-semibold text-gray-900">{sum}</span>{" "}
          รายการ
        </span>
        <span>
          เฉลี่ย/วัน: <span className="font-semibold text-gray-900">{avg}</span>
        </span>
      </div>
      <div
        aria-label="ปริมาณคำร้อง 7 วันล่าสุด (แสดงเป็นแผนภูมิแท่ง)"
        className="mt-4 flex items-end gap-2 sm:gap-3"
        role="img"
      >
        {data.map((point) => {
          const date = new Date(`${point.date}T00:00:00`);
          const height = Math.max(6, Math.round((point.count / max) * 128));
          return (
            <div className="flex min-w-8 flex-1 flex-col items-center" key={point.date}>
              <div className="h-5 text-xs font-semibold text-gray-700">
                {point.count > 0 ? point.count : ""}
              </div>
              <div
                aria-label={`${date.toLocaleDateString("th-TH")}: ${point.count} รายการ`}
                className="w-full rounded-md bg-orange-400"
                style={{ height }}
                title={`${date.toLocaleDateString("th-TH")}: ${point.count} รายการ`}
              />
              <div className="mt-2 text-center text-[10px] leading-tight text-gray-500 sm:text-xs">
                <div>{date.toLocaleDateString("th-TH", { weekday: "short" })}</div>
                <div>{date.toLocaleDateString("th-TH", { day: "2-digit", month: "short" })}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-12 gap-3 px-4 py-4 sm:px-6">
      <div className="col-span-3 h-4 rounded bg-gray-100 sm:col-span-2" />
      <div className="col-span-9 h-4 rounded bg-gray-100 sm:col-span-4" />
      <div className="col-span-6 h-4 rounded bg-gray-100 sm:col-span-3" />
      <div className="col-span-3 h-4 rounded bg-gray-100 sm:col-span-2" />
      <div className="col-span-3 h-8 rounded bg-gray-100 sm:col-span-1" />
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
}

function roleLabel(role: unknown): string {
  return String(role).toLowerCase() === "lecturer" ? "อาจารย์" : "นักศึกษา";
}

function statusBarBg(status: keyof typeof STATUS_LABEL_TH): string {
  switch (status) {
    case "submitted":
      return "bg-sky-200";
    case "processing":
      return "bg-amber-200";
    case "approved":
      return "bg-emerald-200";
    case "rejected":
      return "bg-rose-200";
  }
}

function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 401
  );
}
