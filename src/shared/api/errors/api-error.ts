import type { ApiErrorCode, ApiErrorPayload } from "@/shared/api/types";

export type ApiErrorOptions = Readonly<{
  code?: ApiErrorCode | undefined;
  developerMessage?: string | undefined;
  requestId?: string | undefined;
  status?: number | undefined;
}>;

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly developerMessage: string | null;
  readonly isOperational = true;
  readonly requestId: string | null;
  readonly status: number | null;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.code = options.code ?? "UNKNOWN";
    this.status = options.status ?? null;
    this.requestId = options.requestId ?? null;
    this.developerMessage = options.developerMessage ?? null;
  }

  toPayload(): ApiErrorPayload {
    return {
      code: this.code,
      developerMessage: this.developerMessage,
      message: this.message,
      requestId: this.requestId,
      status: this.status,
    };
  }
}
