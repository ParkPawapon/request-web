"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  getEntityLabel,
  getStatusLabels,
  getTypeLabel,
  listMyPetitions,
  type PetitionSummary,
  type RequestRole,
} from "@/entities/request";
import { useSession } from "@/entities/session/lib/session-context.client";

import { RequestsTable } from "./RequestsTable.client";

type RequestListProps = Readonly<{
  role: RequestRole;
}>;

export function RequestList({ role }: RequestListProps) {
  const router = useRouter();
  const { logout } = useSession();
  const [rows, setRows] = useState<readonly PetitionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const entityLabel = getEntityLabel(role);
  const typeLabel = getTypeLabel(role);
  const statusLabels = getStatusLabels(role);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function loadRows() {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await listMyPetitions(role, controller.signal);
        if (alive) setRows(data);
      } catch (error) {
        if (!alive) return;
        if (isUnauthorized(error)) {
          await logout();
          return;
        }
        setRows([]);
        setErrorMsg(
          role === "lecturer"
            ? "เกิดข้อผิดพลาดในการโหลดรายการคำขอ"
            : "เกิดข้อผิดพลาดในการโหลดรายการคำร้อง",
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    void loadRows();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [logout, role]);

  const headerLabels = useMemo(
    () => ({
      date: "วัน/เดือน/ปี",
      details: "รายละเอียด",
      status: "สถานะ",
      title: typeLabel,
    }),
    [typeLabel],
  );

  const isLecturer = role === "lecturer";

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLecturer ? "ติดตามคำขอ" : "ติดตามคำร้อง"}
          </h1>
          <p className="text-base text-gray-500">
            {isLecturer
              ? "รายการคำขอที่เกี่ยวข้องกับคุณ"
              : "รายการคำร้องที่คุณยื่น"}
          </p>
        </div>
        <button
          aria-label={isLecturer ? "ยื่นคำขอใหม่" : "ยื่นคำร้องใหม่"}
          className="inline-flex items-center rounded-xl bg-[var(--brand-600)] px-4 py-2.5 text-white shadow-sm transition hover:bg-[var(--brand-700)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-300)] focus:ring-offset-2"
          onClick={() => router.push(isLecturer ? "/lecturer-request" : "/student-request")}
          type="button"
        >
          {isLecturer ? "ยื่นคำขอใหม่" : "ยื่นคำร้องใหม่"}
        </button>
      </div>

      <RequestsTable
        entityLabel={entityLabel}
        errorMsg={errorMsg}
        headerLabels={headerLabels}
        loading={loading}
        onClickDetails={(id) =>
          router.push(
            isLecturer
              ? `/lecturer/request/${encodeURIComponent(id)}`
              : `/student/request/${encodeURIComponent(id)}`,
          )
        }
        onRetry={() => window.location.reload()}
        rows={rows}
        statusLabels={statusLabels}
      />
    </>
  );
}

function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 401
  );
}
