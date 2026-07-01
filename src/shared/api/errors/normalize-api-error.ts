import type { ApiErrorCode } from "@/shared/api/types";

import { ApiError } from "./api-error";

type NormalizeApiErrorContext = Readonly<{
  code?: ApiErrorCode | undefined;
  fallbackMessage?: string | undefined;
  requestId?: string | undefined;
  status?: number | undefined;
}>;

type ErrorRecord = Readonly<Record<string, unknown>>;

export function normalizeApiError(
  error: unknown,
  context: NormalizeApiErrorContext = {},
): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new ApiError(context.fallbackMessage ?? "The request timed out.", {
      code: context.code ?? "TIMEOUT",
      requestId: context.requestId,
      status: context.status,
    });
  }

  if (isRecord(error)) {
    return new ApiError(readMessage(error, context), {
      code: readCode(error, context.code),
      developerMessage: readString(error["developerMessage"]),
      requestId: readString(error["requestId"]) ?? context.requestId,
      status: readNumber(error["status"]) ?? context.status,
    });
  }

  if (error instanceof Error) {
    return new ApiError(
      context.fallbackMessage ?? "Unexpected request error.",
      {
        code: context.code ?? "UNKNOWN",
        developerMessage: error.message,
        requestId: context.requestId,
        status: context.status,
      },
    );
  }

  return new ApiError(context.fallbackMessage ?? "Unexpected request error.", {
    code: context.code ?? "UNKNOWN",
    requestId: context.requestId,
    status: context.status,
  });
}

function isRecord(value: unknown): value is ErrorRecord {
  return typeof value === "object" && value !== null;
}

function readMessage(
  value: ErrorRecord,
  context: NormalizeApiErrorContext,
): string {
  return (
    readString(value["message"]) ??
    readString(value["error"]) ??
    context.fallbackMessage ??
    "Request failed."
  );
}

function readCode(
  value: ErrorRecord,
  fallback: ApiErrorCode | undefined,
): ApiErrorCode {
  const code = readString(value["code"]);
  if (isApiErrorCode(code)) {
    return code;
  }

  return fallback ?? "UNKNOWN";
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function isApiErrorCode(value: string | undefined): value is ApiErrorCode {
  return (
    value === "BAD_REQUEST" ||
    value === "UNAUTHORIZED" ||
    value === "FORBIDDEN" ||
    value === "NOT_FOUND" ||
    value === "CONFLICT" ||
    value === "VALIDATION" ||
    value === "RATE_LIMITED" ||
    value === "SERVER" ||
    value === "NETWORK" ||
    value === "TIMEOUT" ||
    value === "UNKNOWN"
  );
}
