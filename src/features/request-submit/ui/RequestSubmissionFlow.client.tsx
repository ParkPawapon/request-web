"use client";

import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import {
  createPetition,
  formatDisplayTextForRole,
  getEntityLabel,
  getTypeLabel,
  listPetitionTypes,
  type PetitionType,
  type RequestRole,
} from "@/entities/request";
import { getCsrfToken } from "@/entities/session";
import { useSession } from "@/entities/session/lib/session-context.client";
import { SearchableSelect } from "@/shared/ui/searchable-select";

const MAX_FILE_MB = 10;
const MAX_FILES = 20;
const MAX_TOTAL_MB = 80;
const STEPS = [
  "ข้อมูลส่วนบุคคล",
  "ยื่นเอกสารที่เกี่ยวข้อง",
  "ข้อกำหนดและเงื่อนไข",
] as const;
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type FileRow = Readonly<{
  file: File | null;
  id: string;
  previewUrl: string | null;
}>;

type RequestSubmissionFlowProps = Readonly<{
  role: RequestRole;
}>;

export function RequestSubmissionFlow({ role }: RequestSubmissionFlowProps) {
  const router = useRouter();
  const { logout, me } = useSession();
  const entityLabel = getEntityLabel(role);
  const typeLabel = getTypeLabel(role);
  const isLecturer = role === "lecturer";
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [types, setTypes] = useState<readonly PetitionType[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesError, setTypesError] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [files, setFiles] = useState<readonly FileRow[]>([]);
  const [agree, setAgree] = useState(false);
  const [agreeCancelRule, setAgreeCancelRule] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const filesRef = useRef<readonly FileRow[]>([]);
  const revokeQueueRef = useRef<string[]>([]);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    async function loadTypes() {
      setTypesLoading(true);
      setTypesError("");
      try {
        const data = await listPetitionTypes(controller.signal);
        if (alive) setTypes(data);
      } catch {
        if (!alive) return;
        setTypes([]);
        setTypesError(
          isLecturer
            ? "ไม่สามารถโหลดรายการประเภทคำขอได้"
            : "ไม่สามารถโหลดรายการประเภทคำร้องได้",
        );
      } finally {
        if (alive) setTypesLoading(false);
      }
    }
    void loadTypes();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [isLecturer]);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    const element = dropRef.current;
    if (!element) return;

    function prevent(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
    }

    function onDrop(event: DragEvent) {
      prevent(event);
      const list = Array.from(event.dataTransfer?.files ?? []);
      if (list.length) addFiles(list);
    }

    element.addEventListener("dragenter", prevent);
    element.addEventListener("dragover", prevent);
    element.addEventListener("dragleave", prevent);
    element.addEventListener("drop", onDrop);
    return () => {
      element.removeEventListener("dragenter", prevent);
      element.removeEventListener("dragover", prevent);
      element.removeEventListener("dragleave", prevent);
      element.removeEventListener("drop", onDrop);
    };
  }, []);

  useEffect(() => {
    return () => {
      for (const url of revokeQueueRef.current) URL.revokeObjectURL(url);
      revokeQueueRef.current = [];
    };
  }, []);

  const selectOptions = useMemo(
    () =>
      types.map((type) => ({
        label: formatDisplayTextForRole(type.petitionTypeName, role),
        value: type.petitionTypeID,
      })),
    [role, types],
  );

  function canAdvanceFrom(current: number) {
    if (current === 0) return true;
    if (current === 1) return Boolean(selectedType) && files.length > 0;
    return true;
  }

  function tryChangeStep(next: number) {
    if (next < step) {
      setStep(next);
      return;
    }
    if (next === step + 1 && canAdvanceFrom(step)) {
      setStep(next);
    }
  }

  function addFiles(list: readonly File[]) {
    const current = filesRef.current;
    const accepted = list.filter(isAllowedFile);
    if (accepted.length === 0) {
      void Swal.fire(
        "ไม่ถูกต้อง",
        `ไฟล์ต้องเป็น PDF/JPEG/PNG/WebP และไม่เกิน ${MAX_FILE_MB}MB`,
        "error",
      );
      return;
    }

    if (current.length + accepted.length > MAX_FILES) {
      void Swal.fire("คำเตือน", `จำนวนไฟล์เกิน ${MAX_FILES} ไฟล์`, "warning");
      return;
    }

    const currentTotal = current.reduce((sum, row) => sum + (row.file?.size ?? 0), 0);
    const newTotal = accepted.reduce((sum, file) => sum + file.size, currentTotal);
    if (newTotal > MAX_TOTAL_MB * 1024 * 1024) {
      void Swal.fire("คำเตือน", `ขนาดไฟล์รวมเกิน ${MAX_TOTAL_MB}MB`, "warning");
      return;
    }

    const next = [...current];
    for (const file of accepted) {
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null;
      if (previewUrl) revokeQueueRef.current.push(previewUrl);
      next.push({ file, id: safeId(), previewUrl });
    }
    setFiles(next);
  }

  function addEmptySlot() {
    if (files.length >= MAX_FILES) {
      void Swal.fire("คำเตือน", `จำนวนไฟล์เกิน ${MAX_FILES} ไฟล์`, "warning");
      return;
    }
    setFiles((current) => [...current, { file: null, id: safeId(), previewUrl: null }]);
  }

  function onFileChange(id: string, file: File | null) {
    if (file && !isAllowedFile(file)) {
      void Swal.fire(
        "ไม่ถูกต้อง",
        `ไฟล์ต้องเป็น PDF/JPEG/PNG/WebP และไม่เกิน ${MAX_FILE_MB}MB`,
        "error",
      );
      return;
    }

    if (file) {
      const others = files.filter((row) => row.id !== id);
      const total = others.reduce((sum, row) => sum + (row.file?.size ?? 0), 0);
      if (total + file.size > MAX_TOTAL_MB * 1024 * 1024) {
        void Swal.fire("คำเตือน", `ขนาดไฟล์รวมเกิน ${MAX_TOTAL_MB}MB`, "warning");
        return;
      }
    }

    setFiles((current) =>
      current.map((row) => {
        if (row.id !== id) return row;
        if (row.previewUrl) URL.revokeObjectURL(row.previewUrl);
        const previewUrl =
          file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
        if (previewUrl) revokeQueueRef.current.push(previewUrl);
        return { ...row, file, previewUrl };
      }),
    );
  }

  function removeFile(id: string) {
    setFiles((current) => {
      const target = current.find((row) => row.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return current.filter((row) => row.id !== id);
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== 2 || submitting || !validateBeforeSubmit()) return;

    const confirm = await Swal.fire({
      cancelButtonText: "ยกเลิก",
      confirmButtonText: isLecturer ? "ส่งคำขอ" : "ส่งคำร้อง",
      icon: "question",
      showCancelButton: true,
      text: "โปรดตรวจสอบข้อมูลและเอกสารให้ถูกต้องก่อนส่ง",
      title: isLecturer ? "ยืนยันการส่งคำขอ?" : "ยืนยันการส่งคำร้อง?",
    });
    if (!confirm.isConfirmed) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("petitionTypeID", selectedType);
      formData.append("submittedType", isLecturer ? "LECTURER" : "STUDENT");
      files.forEach((row, index) => {
        if (row.file) {
          formData.append(
            "attachments[]",
            row.file,
            row.file.name || `file_${index}`,
          );
        }
      });

      const csrfToken = await getCsrfToken();
      await createPetition(role, formData, csrfToken);

      await Swal.fire({
        confirmButtonText: "ตกลง",
        icon: "success",
        text: isLecturer
          ? "ระบบได้รับคำขอของท่านเรียบร้อยแล้ว"
          : "ระบบได้รับคำร้องของท่านเรียบร้อยแล้ว",
        title: isLecturer ? "การส่งคำขอเสร็จสิ้น" : "การส่งคำร้องเสร็จสิ้น",
      });

      clearForm();
      router.replace(isLecturer ? "/lecturer" : "/student");
    } catch (error) {
      if (isUnauthorized(error)) {
        await Swal.fire("กรุณาเข้าสู่ระบบใหม่", "", "warning");
        await logout();
        return;
      }
      await Swal.fire(
        "เกิดข้อผิดพลาด",
        readErrorMessage(error) || "กรุณาลองใหม่ภายหลัง",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function validateBeforeSubmit(): boolean {
    if (!selectedType) {
      void Swal.fire("คำเตือน", `กรุณาเลือก${typeLabel}`, "warning");
      return false;
    }
    if (files.length === 0 || files.every((row) => !row.file)) {
      void Swal.fire("คำเตือน", "กรุณาแนบไฟล์อย่างน้อย 1 ไฟล์", "warning");
      return false;
    }
    if (!agree || !agreeCancelRule) {
      void Swal.fire("คำเตือน", "กรุณายอมรับข้อกำหนดและเงื่อนไข", "warning");
      return false;
    }
    return true;
  }

  function clearForm() {
    for (const row of files) {
      if (row.previewUrl) URL.revokeObjectURL(row.previewUrl);
    }
    setStep(0);
    setFiles([]);
    setAgree(false);
    setAgreeCancelRule(false);
    setSelectedType("");
  }

  return (
    <section className="mx-auto max-w-[980px] space-y-8 md:space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-normal text-gray-900 md:text-3xl">
          {isLecturer
            ? "ระบบยื่นคำขอ สำหรับอาจารย์"
            : "ระบบยื่นคำร้อง สำหรับนักศึกษา"}
        </h1>
        <p className="text-sm text-gray-500 md:text-base">
          โปรดกรอกข้อมูลให้ครบถ้วน และแนบเอกสารที่เกี่ยวข้อง
        </p>
      </header>

      <Stepper onTryChange={tryChangeStep} step={step} />

      <form
        className="rounded-2xl border border-gray-200 bg-white shadow-sm"
        noValidate
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 md:px-7">
          <h2 className="text-lg font-bold text-gray-900 md:text-xl">
            {STEPS[step]}
          </h2>
          <span className="hidden items-center rounded-full bg-[var(--brand-50)] px-3 py-1 text-sm font-semibold text-[var(--brand-700)] ring-1 ring-[var(--brand-100)] md:inline-flex">
            ขั้นตอน {step + 1} / {STEPS.length}
          </span>
        </div>

        <div className="space-y-7 px-6 py-6 md:px-7 md:py-7">
          {step === 0 ? (
            <Section>
              <GridTwo>
                <Field
                  label={isLecturer ? "รหัสอาจารย์" : "รหัสนักศึกษา"}
                  value={readProfileValue(me?.studentID, me?.id)}
                />
                <Field label="ภาควิชา" value="คณิตศาสตร์" />
                <Field label="คณะ/สาขา" value="วิทยาศาสตร์" />
                <Field
                  label="อีเมลของมหาวิทยาลัย"
                  value={readProfileValue(me?.email)}
                />
              </GridTwo>
            </Section>
          ) : null}

          {step === 1 ? (
            <Section>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 md:text-base">
                    {typeLabel} <span className="text-rose-600">*</span>
                  </label>
                  <SearchableSelect
                    listAriaLabel={`รายการ${typeLabel}`}
                    loading={typesLoading}
                    onChange={setSelectedType}
                    options={selectOptions}
                    placeholder={
                      typesLoading
                        ? "กำลังโหลด…"
                        : `พิมพ์เพื่อค้นหา / เลือก${typeLabel}`
                    }
                    required
                    value={selectedType}
                  />
                  {typesError ? (
                    <p className="text-xs text-rose-600">{typesError}</p>
                  ) : null}
                </div>

                <p className="text-base text-gray-700 md:text-lg">
                  แนบเอกสารประกอบ{entityLabel}ได้ทั้ง <b>PDF</b> และ{" "}
                  <b>รูปภาพ</b> (JPEG/PNG/WebP){" "}
                  <span className="font-semibold text-[var(--brand-700)]">
                    จำกัด {MAX_FILE_MB} MB ต่อไฟล์
                  </span>
                </p>

                <div
                  className="rounded-2xl border-2 border-dashed border-[var(--brand-200)] bg-[var(--brand-50)]/40 p-7 text-center transition hover:border-[var(--brand-300)]"
                  ref={dropRef}
                >
                  <p className="text-sm text-gray-700 md:text-base">
                    ลากไฟล์มาวางที่นี่ หรือ
                  </p>
                  <div className="mt-4">
                    <label className="inline-flex cursor-pointer items-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[var(--brand-700)] ring-1 ring-[var(--brand-200)] hover:bg-[var(--brand-50)] md:text-base">
                      เลือกไฟล์
                      <input
                        accept="application/pdf,image/*"
                        className="sr-only"
                        multiple
                        onChange={(event) => {
                          const list = Array.from(event.target.files ?? []);
                          if (list.length) addFiles(list);
                          event.target.value = "";
                        }}
                        type="file"
                      />
                    </label>
                  </div>
                  <p className="mt-3 text-xs text-gray-500 md:text-sm">
                    รองรับ: PDF, JPEG, PNG, WebP — จำกัด {MAX_FILE_MB} MB/ไฟล์
                  </p>
                </div>

                <FileRows
                  files={files}
                  onAddEmptySlot={addEmptySlot}
                  onFileChange={onFileChange}
                  onRemove={removeFile}
                />
              </div>
            </Section>
          ) : null}

          {step === 2 ? (
            <Section>
              <div className="space-y-5">
                <label className="flex items-center gap-3 text-sm font-medium text-gray-800 md:text-base">
                  <input
                    checked={agree}
                    className="size-4 accent-[var(--brand-600)] md:size-5"
                    onChange={(event) => setAgree(event.target.checked)}
                    required
                    type="checkbox"
                  />
                  <span>
                    ข้าพเจ้าขอรับรองว่าได้อ่านและยอมรับข้อกำหนดและเงื่อนไข
                  </span>
                </label>
                <label className="flex items-start gap-3 text-sm font-medium text-gray-800 md:text-base">
                  <input
                    checked={agreeCancelRule}
                    className="mt-1 size-4 accent-[var(--brand-600)] md:size-5"
                    onChange={(event) => setAgreeCancelRule(event.target.checked)}
                    required
                    type="checkbox"
                  />
                  <span>
                    ข้าพเจ้าเข้าใจว่า{" "}
                    <b className="text-[var(--brand-700)]">
                      สามารถยกเลิก{entityLabel}ได้เฉพาะกรณีที่มีสถานะเป็น
                      “การยื่น{entityLabel}เสร็จสิ้น” เท่านั้น
                    </b>
                  </span>
                </label>
                <p className="text-sm leading-relaxed text-gray-700 md:text-base">
                  โปรดตรวจสอบความถูกต้องของข้อมูลและความครบถ้วนของเอกสารประกอบก่อนทำการส่ง{entityLabel}
                  หากส่งข้อมูลไม่ถูกต้อง หรือเอกสารไม่ครบถ้วน จำเป็นต้องยกเลิก{entityLabel}
                  และดำเนินการส่งใหม่
                </p>
              </div>
            </Section>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50/60 px-6 py-4 md:gap-3 md:px-7">
          {step > 0 ? (
            <button
              className="rounded-xl border px-4 py-2 text-sm hover:bg-white md:px-5 md:py-2.5 md:text-base"
              disabled={submitting}
              onClick={() => tryChangeStep(step - 1)}
              type="button"
            >
              ก่อนหน้า
            </button>
          ) : null}

          {step < 2 ? (
            <button
              className="rounded-xl bg-[var(--brand-600)] px-4 py-2 text-sm text-white hover:bg-[var(--brand-700)] disabled:opacity-50 md:px-5 md:py-2.5 md:text-base"
              disabled={submitting || (step === 1 && (!selectedType || files.length === 0))}
              onClick={() => tryChangeStep(step + 1)}
              type="button"
            >
              ถัดไป
            </button>
          ) : (
            <button
              className="rounded-xl bg-[var(--brand-600)] px-4 py-2 text-sm text-white hover:bg-[var(--brand-700)] disabled:opacity-50 md:px-5 md:py-2.5 md:text-base"
              disabled={submitting || !agree || !agreeCancelRule || files.length === 0}
              type="submit"
            >
              {submitting ? "กำลังส่ง…" : `ส่ง${entityLabel}`}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

function FileRows({
  files,
  onAddEmptySlot,
  onFileChange,
  onRemove,
}: Readonly<{
  files: readonly FileRow[];
  onAddEmptySlot: () => void;
  onFileChange: (id: string, file: File | null) => void;
  onRemove: (id: string) => void;
}>) {
  return (
    <div className="space-y-3">
      {files.length === 0 ? (
        <div className="rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-500 md:text-base">
          ยังไม่มีไฟล์แนบ
        </div>
      ) : null}

      {files.map((row) => (
        <div
          className="flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5"
          key={row.id}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-[var(--brand-100)]">
              {row.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- object URLs from local file previews are not Next image assets.
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  src={row.previewUrl}
                />
              ) : row.file ? (
                <span className="text-xs font-semibold text-[var(--brand-700)] md:text-sm">
                  PDF
                </span>
              ) : (
                <span className="text-xs text-gray-400 md:text-sm">—</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-gray-900 md:text-base">
                {row.file?.name || "ยังไม่เลือกไฟล์"}
              </div>
              <div className="text-xs text-gray-500 md:text-sm">
                {row.file
                  ? `${row.file.type || "unknown"} · ${formatBytes(row.file.size)}`
                  : "—"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 md:px-4 md:text-base">
              {row.file ? "เปลี่ยนไฟล์" : "เพิ่มไฟล์"}
              <input
                accept="application/pdf,image/*"
                className="sr-only"
                onChange={(event) => onFileChange(row.id, event.target.files?.[0] ?? null)}
                type="file"
              />
            </label>
            <button
              className="rounded-lg border px-3 py-1.5 text-sm text-rose-600 hover:border-rose-200 hover:bg-rose-50 md:px-4 md:text-base"
              onClick={() => onRemove(row.id)}
              type="button"
            >
              ลบ
            </button>
          </div>
        </div>
      ))}

      <button
        className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 md:text-base"
        disabled={files.length >= MAX_FILES}
        onClick={onAddEmptySlot}
        title={
          files.length >= MAX_FILES ? `จำกัดไม่เกิน ${MAX_FILES} ไฟล์` : undefined
        }
        type="button"
      >
        เพิ่มช่องไฟล์แนบ
      </button>
    </div>
  );
}

function Section({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative rounded-xl border border-gray-200 bg-[var(--brand-50)]/20 p-5 md:p-6">
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[var(--brand-200)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

function GridTwo({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="grid gap-4 md:grid-cols-2 md:gap-5">{children}</div>;
}

function Field({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-gray-700 md:text-base">{label}</div>
      <input
        aria-readonly="true"
        className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm md:px-4 md:py-2.5 md:text-base"
        disabled
        readOnly
        value={value}
      />
    </div>
  );
}

function Stepper({
  onTryChange,
  step,
}: Readonly<{ onTryChange: (step: number) => void; step: number }>) {
  return (
    <nav aria-label="ขั้นตอนการยื่นคำร้อง" className="w-full">
      <ol className="hidden grid-cols-3 gap-6 md:grid">
        {STEPS.map((label, index) => {
          const state = index < step ? "done" : index === step ? "current" : "todo";
          const circleClass =
            state === "done"
              ? "bg-[var(--brand-600)] text-white ring-[var(--brand-600)]"
              : state === "current"
                ? "bg-white text-[var(--brand-700)] ring-[var(--brand-600)]"
                : "bg-white text-gray-400 ring-gray-300";
          return (
            <li className="relative flex items-center gap-4" key={label}>
              <button
                aria-current={state === "current" ? "step" : undefined}
                className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold ring-2 transition ${circleClass}`}
                onClick={() => onTryChange(index)}
                title={label}
                type="button"
              >
                {state === "done" ? "✓" : index + 1}
              </button>
              <div className="min-w-0">
                <div
                  className={`truncate text-lg font-extrabold ${
                    state === "current"
                      ? "text-[var(--brand-700)]"
                      : state === "done"
                        ? "text-gray-800"
                        : "text-gray-400"
                  }`}
                >
                  {label}
                </div>
                <div className="text-xs text-gray-400 md:text-sm">
                  {state === "done"
                    ? "เสร็จแล้ว"
                    : state === "current"
                      ? "ขั้นตอนปัจจุบัน"
                      : "ขั้นตอนถัดไป"}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="grid grid-cols-3 gap-2 md:hidden">
        {STEPS.map((label, index) => (
          <button
            aria-current={index === step ? "step" : undefined}
            className={`rounded-xl px-3 py-2 text-center text-xs font-semibold transition ${
              index === step
                ? "bg-[var(--brand-600)] text-white"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-[var(--brand-50)]"
            }`}
            key={label}
            onClick={() => onTryChange(index)}
            type="button"
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function safeId(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function isAllowedFile(file: File): boolean {
  return (
    ALLOWED_FILE_TYPES.has(file.type) &&
    file.size > 0 &&
    file.size <= MAX_FILE_MB * 1024 * 1024 &&
    file.name.length <= 200
  );
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"] as const;
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
}

function readProfileValue(...values: readonly unknown[]): string {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "ไม่มีข้อมูล";
}

function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 401
  );
}

function readErrorMessage(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "").trim();
    return message || null;
  }
  return null;
}
