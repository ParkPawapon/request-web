"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import {
  cancelPetition,
  formatBytes,
  formatDate,
  formatDateTime,
  formatDisplayTextForRole,
  getEntityLabel,
  getPetitionDetail,
  getStaffPetitionDetail,
  listPetitionAttachments,
  listStaffPetitionAttachments,
  type PetitionAttachment,
  type PetitionDetail,
  type RequestRole,
} from "@/entities/request";
import { getCsrfToken } from "@/entities/session";
import { useSession } from "@/entities/session/lib/session-context.client";
import { StatusPill } from "@/shared/ui/status-pill";

type DetailMode =
  | Readonly<{ role: RequestRole; staff?: false }>
  | Readonly<{ role?: never; staff: true }>;

const ALLOW_CANCEL = new Set(["การยื่นคำร้องเสร็จสิ้น"]);

export function RequestDetail(props: DetailMode) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { logout } = useSession();
  const id = String(params.id ?? "");
  const isStaff = props.staff === true;
  const role: RequestRole = isStaff ? "student" : props.role;
  const entityLabel = isStaff ? "คำร้อง" : getEntityLabel(role);
  const backPath = isStaff
    ? "/staff"
    : role === "lecturer"
      ? "/lecturer"
      : "/student";
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<PetitionDetail | null>(null);
  const [attachments, setAttachments] = useState<readonly PetitionAttachment[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) {
      router.replace(backPath);
      return;
    }

    let alive = true;
    const controller = new AbortController();

    async function loadDetail() {
      setLoading(true);
      setErrorMsg("");
      try {
        const [nextDetail, nextAttachments] = await Promise.all([
          isStaff
            ? getStaffPetitionDetail(id, controller.signal)
            : getPetitionDetail(role, id, controller.signal),
          isStaff
            ? listStaffPetitionAttachments(id, controller.signal)
            : listPetitionAttachments(role, id, controller.signal),
        ]);
        if (!alive) return;
        setDetail(nextDetail);
        setAttachments(nextAttachments);
      } catch (error) {
        if (!alive) return;
        if (isUnauthorized(error)) {
          await logout();
          return;
        }
        setErrorMsg(`ไม่สามารถโหลดรายละเอียด${entityLabel}ได้`);
        setDetail(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    void loadDetail();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [backPath, entityLabel, id, isStaff, logout, role, router]);

  const overall = String(detail?.overallStatus ?? detail?.status ?? "");
  const canShowCancel = !isStaff && Boolean(detail) && ALLOW_CANCEL.has(overall);
  const studentAttachments = useMemo(
    () =>
      attachments.filter((file) => {
        const type = String(file.uploadedByType ?? "").toUpperCase();
        return type !== "STAFF" && type !== "LECTURER";
      }),
    [attachments],
  );
  const staffAttachments = useMemo(
    () =>
      attachments.filter((file) => {
        const type = String(file.uploadedByType ?? "").toUpperCase();
        return type === "STAFF" || type === "LECTURER";
      }),
    [attachments],
  );
  const petitionNumber = detail?.petitionID ?? detail?.petitionId ?? detail?.id ?? id;

  async function onCancelPetition() {
    if (!id || !canShowCancel || cancelling || isStaff) return;

    const ask = await Swal.fire({
      cancelButtonText: "ไม่ยกเลิก",
      confirmButtonColor: "#e11d48",
      confirmButtonText: "ยืนยันยกเลิก",
      icon: "question",
      showCancelButton: true,
      text: `หากยืนยัน ระบบจะยกเลิก${entityLabel}นี้และไม่สามารถดำเนินการต่อได้`,
      title: `ยืนยันการยกเลิก${entityLabel}?`,
    });
    if (!ask.isConfirmed) return;

    setCancelling(true);
    try {
      const csrfToken = await getCsrfToken();
      await cancelPetition(role, id, csrfToken);
      setDetail((current) =>
        current
          ? {
              ...current,
              closedAt: new Date().toISOString(),
              currentStage: "ผู้ยื่นคำร้องยกเลิกคำร้องเรียบร้อยแล้ว",
              overallStatus: "ยกเลิกคำร้องสำเร็จ",
              status: "ยกเลิกคำร้องสำเร็จ",
              updatedAt: new Date().toISOString(),
            }
          : current,
      );
      await Swal.fire({
        confirmButtonText: "ตกลง",
        icon: "success",
        text: `ระบบได้ยกเลิก${entityLabel}ของคุณเรียบร้อยแล้ว`,
        title: `ยกเลิก${entityLabel}สำเร็จ`,
      });
    } catch (error) {
      if (isUnauthorized(error)) {
        await Swal.fire("กรุณาเข้าสู่ระบบใหม่", "", "warning");
        await logout();
        return;
      }
      await Swal.fire("เกิดข้อผิดพลาด", "กรุณาลองใหม่ภายหลัง", "error");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-normal text-gray-900 sm:text-3xl md:text-4xl">
            รายละเอียด{entityLabel}
          </h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base md:text-lg">
            ดูสถานะและเอกสารประกอบของ{entityLabel}
          </p>
        </div>
        <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
          {canShowCancel ? (
            <button
              aria-disabled={cancelling}
              className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-rose-100 disabled:text-rose-400 md:px-5 md:text-base"
              disabled={cancelling}
              onClick={() => void onCancelPetition()}
              type="button"
            >
              {cancelling ? "กำลังยกเลิก…" : `ยกเลิก${entityLabel}`}
            </button>
          ) : null}
          <button
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-300)] focus:ring-offset-2 md:px-5 md:text-base"
            onClick={() => router.push(backPath)}
            type="button"
          >
            กลับหน้ารายการ
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-md sm:p-6 md:p-8">
        {loading ? (
          <Skeleton />
        ) : !detail ? (
          <div className="text-lg text-gray-600">ไม่พบข้อมูล{entityLabel}</div>
        ) : (
          <div className="space-y-8 md:space-y-10">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 sm:text-sm md:text-base">
                  หมายเลข{entityLabel}
                </div>
                <div className="break-all text-2xl font-black text-gray-900 md:text-3xl">
                  #{String(petitionNumber)}
                </div>
              </div>
              <StatusPill
                status={formatDisplayTextForRole(overall, role)}
                labels={role === "lecturer" ? lecturerStatusLabels : undefined}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <SummaryCard
                helper={`ปีการศึกษา: ${detail.ptYear ?? "—"} • ภาคเรียน: ${detail.ptSemester ?? "—"}`}
                label={role === "lecturer" && !isStaff ? "ประเภทคำขอ" : "ประเภทคำร้อง"}
                value={
                  formatDisplayTextForRole(detail.petitionTypeName ?? "", role) ||
                  "ไม่ระบุประเภท"
                }
              />
              <SummaryCard
                helper={`สถานะโดยรวม: ${formatDisplayTextForRole(overall || "—", role)}`}
                label="ขั้นตอนปัจจุบัน"
                value={formatDisplayTextForRole(detail.currentStage ?? "—", role)}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <MetaCard
                label={`วันที่ยื่น${entityLabel}`}
                value={formatDateTime(detail.submittedAt)}
              />
              <MetaCard label={`ปิด${entityLabel}`} value={formatDateTime(detail.closedAt)} />
              <MetaCard label="ปรับปรุงล่าสุด" value={formatDateTime(detail.updatedAt)} />
            </div>

            {isStaff ? (
              <SummaryCard
                label="ผู้ยื่น"
                value={`${detail.requesterName ?? "—"}${
                  detail.requesterRole ? ` • ${roleLabel(detail.requesterRole)}` : ""
                }`}
              />
            ) : null}

            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 md:text-base">
                บันทึก/หมายเหตุ
              </div>
              <div className="mt-3 whitespace-pre-wrap break-words text-base leading-relaxed text-gray-900 md:text-lg">
                {String(detail.annotation ?? "").trim() || "—"}
              </div>
            </div>

            <AttachmentSection
              count={studentAttachments.length}
              emptyText="ไม่มีเอกสารแนบ"
              files={studentAttachments}
              title={isStaff ? "เอกสารจากผู้ยื่น" : `เอกสารที่${role === "lecturer" ? "อาจารย์" : "นักศึกษา"}แนบ`}
            />
            <AttachmentSection
              count={staffAttachments.length}
              emptyText="ยังไม่มีเอกสารจากเจ้าหน้าที่"
              files={staffAttachments}
              title="เอกสารจากเจ้าหน้าที่"
            />
          </div>
        )}
      </div>

      {errorMsg ? (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 md:text-base">
          {errorMsg}
        </div>
      ) : null}
    </>
  );
}

const lecturerStatusLabels = {
  approved: "คำขอได้รับการอนุมัติ",
  cancelled: "ยกเลิกคำขอสำเร็จ",
  processing: "อยู่ระหว่างการดำเนินการ",
  rejected: "ถูกยกเลิกคำขอ (ตีกลับ)",
  submitted: "การยื่นคำขอเสร็จสิ้น",
};

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-72 animate-pulse rounded bg-gray-100" />
      <div className="h-5 w-96 max-w-full animate-pulse rounded bg-gray-100" />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
    </div>
  );
}

function SummaryCard({
  helper,
  label,
  value,
}: Readonly<{ helper?: string; label: string; value: string }>) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-5">
      <div className="text-sm text-gray-500 md:text-base">{label}</div>
      <div className="mt-1 text-lg font-bold text-gray-900 md:text-xl">{value}</div>
      {helper ? <div className="mt-3 text-sm text-gray-600 md:text-base">{helper}</div> : null}
    </div>
  );
}

function MetaCard({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-gray-500 md:text-base">{label}</div>
      <div className="mt-2 break-words text-base font-semibold text-gray-900 md:text-lg">
        {value}
      </div>
    </div>
  );
}

function AttachmentSection({
  count,
  emptyText,
  files,
  title,
}: Readonly<{
  count: number;
  emptyText: string;
  files: readonly PetitionAttachment[];
  title: string;
}>) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4 text-lg font-bold text-gray-900 md:text-xl">
        <span>{title}</span>
        <span className="font-medium text-gray-500">({count})</span>
      </div>
      {count === 0 ? (
        <div className="px-5 py-8 text-base text-gray-500 md:text-lg">
          {emptyText}
        </div>
      ) : (
        <ul className="divide-y">
          {files.map((file) => (
            <li
              className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"
              key={String(file.attachmentID ?? file.id ?? file.fileName)}
            >
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-base font-semibold text-gray-900 md:text-lg"
                  title={file.fileName ?? ""}
                >
                  {file.fileName || "ไฟล์ไม่ระบุชื่อ"}
                </div>
                <div className="text-xs text-gray-500 md:text-sm">
                  {file.contentType || "unknown"} • {formatBytes(file.bytesize)} •
                  อัปโหลด {formatDate(file.createdAt)}
                </div>
              </div>
              {file.downloadPath ? (
                <a
                  aria-label={`ดาวน์โหลดไฟล์ ${file.fileName || ""}`}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--brand-200)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-700)] transition hover:border-[var(--brand-300)] hover:bg-[var(--brand-50)] sm:w-auto md:text-base"
                  download={file.fileName || true}
                  href={normalizeDownloadPath(file.downloadPath)}
                >
                  ดาวน์โหลด
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function roleLabel(role: unknown): string {
  return String(role).toLowerCase() === "lecturer" ? "อาจารย์" : "นักศึกษา";
}

function normalizeDownloadPath(path: string | null | undefined): string {
  if (!path) return "#";
  if (path.startsWith("/api/v1/")) {
    return path.replace(/^\/api\/v1/u, "/v1");
  }
  return path;
}

function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 401
  );
}
