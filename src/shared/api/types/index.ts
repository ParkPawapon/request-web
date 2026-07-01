import type { EntityId, Nullable } from "@/shared/types";

export type ApiId<TName extends string = "ApiEntity"> = EntityId<TName>;

export type ApiNullable<TValue> = Nullable<TValue>;

export type PaginationParams = Readonly<{
  page: number;
  pageSize: number;
}>;

export type PaginationMeta = Readonly<{
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}>;

export type ApiSuccess<TData> = Readonly<{
  data: TData;
  meta?: Record<string, unknown>;
}>;

export type ApiPaginatedSuccess<TItem> = Readonly<{
  data: readonly TItem[];
  pagination: PaginationMeta;
}>;

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "RATE_LIMITED"
  | "SERVER"
  | "NETWORK"
  | "TIMEOUT"
  | "UNKNOWN";

export type ApiErrorPayload = Readonly<{
  code: ApiErrorCode;
  message: string;
  status: number | null;
  requestId: string | null;
  developerMessage: string | null;
}>;
