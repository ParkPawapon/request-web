const DEFAULT_REDIRECT_FALLBACK = "/";

export function normalizeInternalRedirect(
  value: string | null | undefined,
  fallback = DEFAULT_REDIRECT_FALLBACK,
): string {
  const safeFallback = isSafeInternalPath(fallback)
    ? fallback
    : DEFAULT_REDIRECT_FALLBACK;

  if (!value) {
    return safeFallback;
  }

  const trimmed = value.trim();

  if (!isSafeInternalPath(trimmed)) {
    return safeFallback;
  }

  try {
    const url = new URL(trimmed, "https://request-web.local");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return safeFallback;
  }
}

function isSafeInternalPath(value: string): boolean {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\\\u0000-\u001F\u007F]/u.test(value) &&
    !/^[a-z][a-z\d+.-]*:/iu.test(value)
  );
}
