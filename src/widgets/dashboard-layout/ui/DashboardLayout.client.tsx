"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  CheckCircle2,
  CircleX,
  ClipboardList,
  FileClock,
  FilePlus,
  LayoutDashboard,
  Loader2,
  LogOut,
  type LucideIcon,
} from "lucide-react";

import { useSession } from "@/entities/session/lib/session-context.client";
import { formatFullName } from "@/entities/session";

type DashboardVariant = "lecturer" | "staff" | "student";

type NavItem = Readonly<{
  href: string;
  icon: LucideIcon;
  label: string;
}>;

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
  homePath?: string;
  navItems?: readonly NavItem[];
  title?: string;
  variant?: DashboardVariant;
}>;

const DEFAULT_MENUS: Record<DashboardVariant, readonly NavItem[]> = {
  lecturer: [
    { href: "/lecturer", icon: ClipboardList, label: "ติดตามคำขอ" },
    { href: "/lecturer-request", icon: FilePlus, label: "ยื่นคำขอ" },
  ],
  staff: [
    { href: "/staff", icon: LayoutDashboard, label: "สรุปภาพรวม" },
    { href: "/staff-request-submitted", icon: FileClock, label: "รอการตรวจสอบ" },
    { href: "/staff-request-pending", icon: Loader2, label: "กำลังดำเนินการ" },
    { href: "/staff-request-approved", icon: CheckCircle2, label: "อนุมัติสำเร็จ" },
    { href: "/staff-request-rejected", icon: CircleX, label: "ที่ถูกยกเลิก" },
  ],
  student: [
    { href: "/student", icon: ClipboardList, label: "ติดตามคำร้อง" },
    { href: "/student-request", icon: FilePlus, label: "ยื่นคำร้อง" },
  ],
};

export function DashboardLayout({
  children,
  homePath,
  navItems,
  title,
  variant = "student",
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const { logout, me } = useSession();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerId = "dashboard-menu-button";

  const menus = navItems ?? DEFAULT_MENUS[variant];
  const computedHomePath =
    homePath ?? (variant === "staff" ? "/staff" : variant === "lecturer" ? "/lecturer" : "/student");
  const resolvedTitle =
    title ?? (variant === "lecturer" ? "ระบบยื่นคำขอ" : "ระบบยื่นคำร้อง");

  const homeAria = useMemo(() => {
    if (variant === "lecturer") return "ไปหน้าหลักระบบยื่นคำขอ (อาจารย์)";
    if (variant === "staff") return "ไปหน้าหลักระบบยื่นคำร้อง (เจ้าหน้าที่)";
    return "ไปหน้าหลักระบบยื่นคำร้อง (นักศึกษา)";
  }, [variant]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      document.getElementById(hamburgerId)?.focus();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open || !drawerRef.current) return;

    const panel = drawerRef.current;
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    first?.focus();

    function handleTab(event: KeyboardEvent) {
      if (event.key !== "Tab" || focusable.length === 0 || !first || !last) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    panel.addEventListener("keydown", handleTab);
    return () => panel.removeEventListener("keydown", handleTab);
  }, [open]);

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-80 flex-col border-r border-gray-200 bg-white text-gray-900 lg:flex">
        <BrandBlock />
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {menus.map((item) => (
            <NavEntry
              item={item}
              key={item.href}
              onNavigate={() => setOpen(false)}
              pathname={pathname}
            />
          ))}
        </nav>
        <div className="p-4">
          <LogoutButton onLogout={handleLogout} />
        </div>
      </aside>

      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      <div
        aria-label="เมนูนำทาง"
        aria-modal="true"
        className={`fixed left-0 top-0 z-50 h-full w-80 border-r border-gray-200 bg-white text-gray-900 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        ref={drawerRef}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <BrandBlock compact />
          <HamburgerButton
            id={hamburgerId}
            onClick={() => setOpen(false)}
            open
          />
        </div>
        <nav className="space-y-2 p-4">
          {menus.map((item) => (
            <NavEntry
              item={item}
              key={item.href}
              onNavigate={() => setOpen(false)}
              pathname={pathname}
            />
          ))}
          <LogoutButton onLogout={handleLogout} />
        </nav>
      </div>

      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur lg:pl-80">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <HamburgerButton
                className="lg:hidden"
                id={hamburgerId}
                onClick={() => setOpen((current) => !current)}
                open={open}
              />
              <Link
                aria-label={homeAria}
                className="hidden text-base font-semibold tracking-normal text-gray-800 transition-colors hover:text-[var(--brand-700)] sm:inline md:text-lg lg:text-xl"
                href={computedHomePath}
              >
                {resolvedTitle}
              </Link>
            </div>
            <div className="text-xs font-medium text-gray-700 sm:text-sm md:text-base">
              สวัสดี,{" "}
              <span className="font-semibold text-gray-900">
                {formatFullName(me)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 lg:pl-80">
        <div className="mx-auto max-w-[1400px] px-4 py-6">{children}</div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500 lg:pl-80">
        พัฒนาระบบโดย ภาควิชาคณิตศาสตร์ มหาวิทยาเทคโนโลยีพระจอมเกล้าธนบุรี
      </footer>
    </div>
  );
}

function BrandBlock({ compact = false }: Readonly<{ compact?: boolean }>) {
  return (
    <div className="flex items-center gap-3 px-6 py-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-50)]">
        <Image
          alt="Department of Mathematics"
          className="h-10 w-10 object-contain"
          height={40}
          src="/assets/images/dpit.png"
          width={40}
        />
      </div>
      <div className="leading-tight">
        <div className="text-lg font-bold text-[var(--brand-700)]">
          ภาควิชาคณิตศาสตร์
        </div>
        {compact ? null : (
          <div className="text-sm text-gray-500">
            ม.เทคโนโลยีพระจอมเกล้าธนบุรี
          </div>
        )}
      </div>
    </div>
  );
}

function NavEntry({
  item,
  onNavigate,
  pathname,
}: Readonly<{ item: NavItem; onNavigate: () => void; pathname: string }>) {
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={[
        "flex items-center gap-3 rounded-lg px-5 py-3.5 text-lg font-semibold transition lg:text-xl",
        active
          ? "bg-[var(--brand-50)] text-[var(--brand-700)] ring-1 ring-[var(--brand-100)]"
          : "text-gray-700 hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)]",
      ].join(" ")}
      href={item.href}
      onClick={onNavigate}
    >
      <Icon className="shrink-0" size={22} />
      <span>{item.label}</span>
    </Link>
  );
}

function LogoutButton({
  onLogout,
}: Readonly<{ onLogout: () => Promise<void> }>) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-lg px-5 py-3.5 text-left text-lg font-semibold text-gray-700 transition hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] lg:text-xl"
      onClick={() => void onLogout()}
      type="button"
    >
      <LogOut size={22} />
      <span>ออกจากระบบ</span>
    </button>
  );
}

function HamburgerButton({
  className = "",
  id,
  onClick,
  open,
}: Readonly<{
  className?: string;
  id: string;
  onClick: () => void;
  open: boolean;
}>) {
  return (
    <button
      aria-expanded={open ? "true" : "false"}
      aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
      className={`group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--brand-50)] bg-white/90 backdrop-blur transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-600)] ${className}`}
      id={id}
      onClick={onClick}
      type="button"
    >
      <span className="relative block h-4 w-6" aria-hidden="true">
        <span
          className={`absolute left-0 top-0 h-0.5 w-6 rounded bg-[var(--brand-700)] transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
            open ? "translate-y-[7px] rotate-45" : ""
          }`}
        />
        <span
          className={`absolute left-0 top-1/2 h-0.5 w-6 -translate-y-1/2 rounded bg-[var(--brand-700)] transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
            open ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-6 rounded bg-[var(--brand-700)] transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
            open ? "-translate-y-[7px] -rotate-45" : ""
          }`}
        />
      </span>
    </button>
  );
}
