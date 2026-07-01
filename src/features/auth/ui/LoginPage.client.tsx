"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import {
  getCsrfToken,
  getDevAuthOptions,
  getSsoLoginUrl,
  loginWithDevAccount,
  type DevAuthOption,
} from "@/entities/session";

const ROLE_LABELS = {
  lecturer: "อาจารย์",
  staff: "เจ้าหน้าที่",
  student: "นักศึกษา",
} as const;

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [devLoading, setDevLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [csrf, setCsrf] = useState("");
  const [error, setError] = useState("");
  const [devAuthEnabled, setDevAuthEnabled] = useState(false);
  const [devOptions, setDevOptions] = useState<readonly DevAuthOption[]>([]);
  const [selectedDevKey, setSelectedDevKey] = useState("");
  const selectedDevOption = useMemo(
    () => devOptions.find((item) => item.key === selectedDevKey) ?? null,
    [devOptions, selectedDevKey],
  );

  useEffect(() => {
    const ssoError = searchParams.get("sso_error");
    if (!ssoError) return;
    void Swal.fire({
      confirmButtonText: "ตกลง",
      icon: "error",
      text: ssoError,
      title: "เข้าสู่ระบบไม่สำเร็จ",
    });
    window.history.replaceState({}, "", window.location.pathname);
  }, [searchParams]);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function bootstrapLogin() {
      try {
        const csrfToken = await getCsrfToken(controller.signal);
        if (!alive) return;
        setCsrf(csrfToken);

        const devData = await getDevAuthOptions(controller.signal).catch(() => null);
        if (!alive || !devData?.enabled) return;

        const options = devData.options ?? [];
        setDevOptions(options);
        setDevAuthEnabled(true);
        setSelectedDevKey((current) => current || options[0]?.key || "");
      } catch {
        if (alive) setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      }
    }

    void bootstrapLogin();
    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  function onSsoLogin() {
    if (devLoading || ssoLoading) return;
    setError("");
    setSsoLoading(true);
    try {
      window.location.assign(getSsoLoginUrl());
    } catch {
      setSsoLoading(false);
      void Swal.fire({
        confirmButtonText: "ตกลง",
        icon: "error",
        text: "กรุณาลองใหม่ หรือใช้ตัวจำลอง local หากเปิดใช้งานอยู่",
        title: "ไม่สามารถเริ่มการเข้าสู่ระบบ",
      });
    }
  }

  async function onDevLogin() {
    if (!csrf || !selectedDevOption || devLoading || ssoLoading) return;
    setError("");
    setDevLoading(true);

    try {
      const data = await loginWithDevAccount(
        {
          id: selectedDevOption.id,
          remember: true,
          role: selectedDevOption.role,
        },
        csrf,
      );
      await Swal.fire({
        icon: "success",
        showConfirmButton: false,
        timer: 900,
        title: "เข้าสู่ระบบตัวจำลองสำเร็จ",
      });
      router.replace(data.redirect || "/student");
    } catch (loginError) {
      const message =
        readErrorMessage(loginError) || "เข้าสู่ระบบแบบตัวจำลองไม่สำเร็จ";
      setError(message);
      await Swal.fire({
        confirmButtonText: "ตกลง",
        icon: "error",
        text: message,
        title: "เข้าใช้งาน local ไม่สำเร็จ",
      });
      if (isForbidden(loginError)) {
        const nextCsrf = await getCsrfToken().catch(() => "");
        setCsrf(nextCsrf);
      }
    } finally {
      setDevLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center overflow-x-hidden bg-white px-5 py-12 text-gray-900">
      <div className="w-full max-w-7xl">
        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex max-w-[600px] flex-col gap-5">
            <div aria-hidden="true" className="w-[min(200px,45vw)]">
              <Image
                alt=""
                aria-hidden="true"
                className="h-auto w-full object-contain"
                height={180}
                src="/assets/images/dpitx65yrs.png"
                width={300}
              />
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-orange-100 px-3.5 py-1.5 text-xs font-semibold tracking-normal text-amber-700">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_0_6px_rgba(249,115,22,0.15)]"
              />
              <span>KMUTT Mathematics Request Hub</span>
            </div>

            <h1 className="m-0 flex flex-wrap gap-x-2 text-[32px] font-semibold leading-[1.1] tracking-normal sm:text-[44px] lg:text-[56px]">
              <span className="text-orange-600">ระบบยื่นคำร้อง</span>
              <span className="text-amber-500">และติดตามผล</span>
            </h1>

            <p className="m-0 text-lg font-medium leading-7 text-slate-600 sm:text-2xl">
              ระบบยื่นคำร้องสำหรับนักศึกษา ภาควิชาคณิตศาสตร์
            </p>

            <div className="flex flex-wrap gap-2.5">
              <span className="rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-sm font-medium text-amber-700">
                ยืนยันตัวตนด้วย SSO
              </span>
              <span className="rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-sm font-medium text-amber-700">
                ติดตามสถานะเรียลไทม์
              </span>
              <span className="rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-sm font-medium text-amber-700">
                จัดการเอกสารครบวงจร
              </span>
            </div>

            <div className="mt-3 flex">
              <button
                aria-busy={ssoLoading ? "true" : "false"}
                className="inline-flex w-full items-center justify-center gap-3 rounded-[14px] border border-orange-300 bg-[linear-gradient(110deg,#f97316_0%,#f59e0b_45%,#f97316_100%)] px-6 py-3.5 text-base font-semibold text-white shadow-[0_20px_40px_-24px_rgba(249,115,22,0.7)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-24px_rgba(249,115,22,0.75)] disabled:cursor-not-allowed disabled:opacity-75 sm:w-auto sm:text-lg"
                disabled={devLoading || ssoLoading}
                onClick={onSsoLogin}
                type="button"
              >
                <span>
                  {ssoLoading
                    ? "กำลังไปยัง KMUTT SSO..."
                    : "เข้าสู่ระบบด้วย KMUTT Account"}
                </span>
                <span aria-hidden="true">→</span>
              </button>
            </div>

            {devAuthEnabled ? (
              <section className="mt-3 grid max-w-xl gap-3.5 rounded-2xl border border-orange-200 bg-white/95 p-5 shadow-[0_22px_38px_-28px_rgba(15,23,42,0.3)]">
                <div className="grid gap-1.5">
                  <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-normal text-orange-700">
                    Local only
                  </span>
                  <h2 className="m-0 text-[22px] font-semibold text-gray-900">
                    เข้าใช้งานแบบตัวจำลอง
                  </h2>
                  <p className="m-0 text-sm leading-6 text-slate-600">
                    ใช้สำหรับเครื่อง local โดยไม่ต้องผ่าน OAuth และไม่กระทบ production
                  </p>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-600">
                    เลือกบัญชีจำลอง
                  </span>
                  <select
                    className="min-h-12 w-full rounded-xl border border-slate-300 bg-orange-50 px-3.5 text-[15px] text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-100"
                    disabled={devLoading || ssoLoading || devOptions.length === 0}
                    onChange={(event) => setSelectedDevKey(event.target.value)}
                    value={selectedDevKey}
                  >
                    {devOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {ROLE_LABELS[option.role]} | {option.label}
                        {option.source === "mock" ? " | mock" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedDevOption ? (
                  <p className="m-0 text-sm leading-6 text-gray-500">
                    {ROLE_LABELS[selectedDevOption.role]} •{" "}
                    {selectedDevOption.subtitle ||
                      selectedDevOption.email ||
                      selectedDevOption.id}
                  </p>
                ) : null}

                <button
                  className="rounded-[14px] bg-slate-800 px-4 py-3 text-[15px] font-semibold text-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={!csrf || !selectedDevOption || devLoading || ssoLoading}
                  onClick={() => void onDevLogin()}
                  type="button"
                >
                  {devLoading ? "กำลังเข้าใช้งาน..." : "เข้าใช้งาน local ด้วยตัวจำลอง"}
                </button>

                {error ? <p className="m-0 text-sm text-red-600">{error}</p> : null}
              </section>
            ) : error ? (
              <p className="m-0 text-sm text-red-600">{error}</p>
            ) : null}
          </div>

          <div aria-hidden="true" className="hidden min-h-[420px] lg:block">
            <div className="relative h-full">
              <div className="absolute left-12 top-20 h-24 w-48 rounded-[20px] border-[6px] border-orange-400 bg-white shadow-xl" />
              <div className="absolute right-8 top-16 h-28 w-44 rounded-[22px] border-[6px] border-amber-400 bg-white shadow-xl" />
              <div className="absolute bottom-12 left-28 h-24 w-56 rounded-[20px] border-[6px] border-orange-300 bg-white shadow-xl" />
              <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[10px] border-orange-400 bg-white shadow-2xl">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-3xl font-bold text-white">
                  ✓
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-9 text-center text-xs text-gray-400">
          พัฒนาระบบโดย{" "}
          <span className="font-semibold text-[var(--brand-700)]">
            ภาควิชาคณิตศาสตร์ มหาวิทยาเทคโนโลยีพระจอมเกล้าธนบุรี
          </span>
        </footer>
      </div>
    </main>
  );
}

function readErrorMessage(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "").trim();
    return message || null;
  }
  return null;
}

function isForbidden(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 403
  );
}
