"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export type SearchableSelectOption = Readonly<{
  label: string;
  value: string;
}>;

type SearchableSelectProps = Readonly<{
  clearLabel?: string;
  disabled?: boolean;
  emptyText?: string;
  itemHeight?: number;
  listAriaLabel?: string;
  loading?: boolean;
  loadingText?: string;
  onChange: (value: string) => void;
  options: readonly SearchableSelectOption[];
  placeholder?: string;
  required?: boolean;
  toggleLabel?: string;
  value: string;
  virtualizationHeight?: number;
}>;

export function SearchableSelect({
  clearLabel = "ล้าง",
  disabled = false,
  emptyText = "ไม่พบรายการ",
  itemHeight = 40,
  listAriaLabel = "รายการ",
  loading = false,
  loadingText = "กำลังโหลด…",
  onChange,
  options,
  placeholder = "ค้นหา…",
  required = false,
  toggleLabel = "Toggle options",
  value,
  virtualizationHeight = 320,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const collator = useMemo(
    () =>
      new Intl.Collator(["th", "en"], { sensitivity: "base", usage: "search" }),
    [],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((option) =>
      includesLocale(option.label, query, collator),
    );
  }, [collator, options, query]);

  const visibleCount = Math.max(
    1,
    Math.floor(virtualizationHeight / itemHeight),
  );
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
  const endIndex = Math.min(filtered.length, startIndex + visibleCount + 4);
  const selectedLabel = options.find((option) => option.value === value)?.label;
  const safeHighlight = Math.min(highlight, Math.max(filtered.length - 1, 0));

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function commit(option: SearchableSelectOption | undefined) {
    onChange(option?.value ?? "");
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function ensureVisible(index: number) {
    const list = listRef.current;
    if (!list) return;
    const top = index * itemHeight;
    const bottom = top + itemHeight;
    const viewTop = list.scrollTop;
    const viewBottom = viewTop + virtualizationHeight;
    if (top < viewTop) list.scrollTop = top;
    else if (bottom > viewBottom) list.scrollTop = bottom - virtualizationHeight;
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      event.preventDefault();
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = Math.min(safeHighlight + 1, filtered.length - 1);
      setHighlight(next);
      ensureVisible(next);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.max(safeHighlight - 1, 0);
      setHighlight(next);
      ensureVisible(next);
    } else if (event.key === "Enter") {
      event.preventDefault();
      commit(filtered[safeHighlight]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-[var(--brand-300)] md:px-4">
        <span className="text-gray-400" aria-hidden="true">
          ⌕
        </span>
        <input
          ref={inputRef}
          aria-controls={listId}
          aria-expanded={open}
          aria-haspopup="listbox"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none md:text-base"
          disabled={disabled || loading}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          required={required && !value}
          role="combobox"
          spellCheck={false}
          type="text"
          value={open ? query : selectedLabel ?? ""}
        />
        {value ? (
          <button
            aria-label={clearLabel}
            className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
            onClick={() => {
              onChange("");
              setQuery("");
              inputRef.current?.focus();
            }}
            type="button"
          >
            {clearLabel}
          </button>
        ) : null}
        <button
          aria-label={toggleLabel}
          className="rounded-md px-2 py-1 text-gray-400 hover:bg-gray-100"
          onClick={() => setOpen((current) => !current)}
          tabIndex={-1}
          type="button"
        >
          ▾
        </button>
      </div>

      {open ? (
        <div
          className="absolute z-20 mt-2 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg"
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          ref={listRef}
          style={{ maxHeight: virtualizationHeight }}
        >
          <ul
            aria-label={listAriaLabel}
            id={listId}
            role="listbox"
            style={{ height: filtered.length * itemHeight, position: "relative" }}
          >
            {loading ? (
              <li className="px-4 py-3 text-sm text-gray-500">{loadingText}</li>
            ) : filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">{emptyText}</li>
            ) : (
              filtered.slice(startIndex, endIndex).map((option, index) => {
                const realIndex = startIndex + index;
                const active = realIndex === safeHighlight;
                const selected = option.value === value;
                return (
                  <li
                    aria-selected={selected}
                    className={[
                      "absolute left-0 right-0 flex cursor-pointer items-center px-4",
                      active ? "bg-[var(--brand-50)]" : "hover:bg-gray-50",
                      selected
                        ? "font-semibold text-[var(--brand-700)]"
                        : "text-gray-700",
                    ].join(" ")}
                    key={option.value}
                    onClick={() => commit(option)}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setHighlight(realIndex)}
                    role="option"
                    style={{ height: itemHeight, top: realIndex * itemHeight }}
                    title={option.label}
                  >
                    <span className="truncate text-sm md:text-base">
                      {option.label}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function normalize(value: unknown): string {
  return String(value ?? "").normalize("NFC").toLowerCase().trim();
}

function includesLocale(
  haystack: string,
  needle: string,
  collator: Intl.Collator,
): boolean {
  const normalizedHaystack = normalize(haystack);
  const normalizedNeedle = normalize(needle);
  if (!normalizedNeedle) return true;
  if (normalizedHaystack.includes(normalizedNeedle)) return true;
  return normalizedHaystack
    .split(/\s+/u)
    .some(
      (token) =>
        token.startsWith(normalizedNeedle) ||
        collator.compare(token, normalizedNeedle) === 0,
    );
}
