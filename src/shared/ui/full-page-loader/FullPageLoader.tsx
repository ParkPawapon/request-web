type FullPageLoaderProps = Readonly<{
  label?: string;
}>;

export function FullPageLoader({
  label = "กำลังโหลดข้อมูล...",
}: FullPageLoaderProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,#fff6f1_0%,#ffffff_60%,#fff0e7_100%)] text-gray-800"
      role="status"
      aria-live="polite"
    >
      <div className="flex gap-2.5" aria-hidden="true">
        <span className="h-4 w-4 animate-bounce rounded-full bg-[var(--brand-500)] shadow-[0_8px_22px_rgba(246,106,56,0.35)]" />
        <span className="h-4 w-4 animate-bounce rounded-full bg-[var(--brand-500)] shadow-[0_8px_22px_rgba(246,106,56,0.35)] [animation-delay:120ms]" />
        <span className="h-4 w-4 animate-bounce rounded-full bg-[var(--brand-500)] shadow-[0_8px_22px_rgba(246,106,56,0.35)] [animation-delay:240ms]" />
      </div>
      <p className="m-0 font-semibold tracking-normal">{label}</p>
    </div>
  );
}
