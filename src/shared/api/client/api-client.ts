import { publicEnv } from "@/shared/config/env";

import { normalizeApiError } from "../errors";
import type { ApiErrorCode } from "../types";

export type HttpMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export type AccessTokenProvider = () =>
  | Promise<string | null>
  | string
  | null;

export type ApiClientOptions = Readonly<{
  baseUrl?: string | undefined;
  cache?: RequestCache | undefined;
  credentials?: RequestCredentials | undefined;
  defaultHeaders?: HeadersInit | undefined;
  fetcher?: typeof fetch | undefined;
  getAccessToken?: AccessTokenProvider | undefined;
  timeoutMs?: number | undefined;
}>;

export type ApiRequestOptions<TBody = unknown> = Readonly<{
  body?: TBody | undefined;
  headers?: HeadersInit | undefined;
  method?: HttpMethod | undefined;
  path: string;
  signal?: AbortSignal | undefined;
}>;

const DEFAULT_TIMEOUT_MS = 15_000;

export class ApiClient {
  private readonly baseUrl: string;
  private readonly cache: RequestCache;
  private readonly credentials: RequestCredentials;
  private readonly defaultHeaders: HeadersInit | undefined;
  private readonly fetcher: typeof fetch;
  private readonly getAccessToken: AccessTokenProvider | undefined;
  private readonly timeoutMs: number;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "";
    this.cache = options.cache ?? "no-store";
    this.credentials = options.credentials ?? "include";
    this.defaultHeaders = options.defaultHeaders;
    this.fetcher = options.fetcher ?? fetch;
    this.getAccessToken = options.getAccessToken;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async request<TResponse, TBody = unknown>(
    options: ApiRequestOptions<TBody>,
  ): Promise<TResponse> {
    const abort = createTimeoutSignal(options.signal, this.timeoutMs);

    try {
      const body = serializeBody(options.body);
      const requestInit: RequestInit = {
        cache: this.cache,
        credentials: this.credentials,
        headers: await this.buildHeaders(options),
        method: options.method ?? "GET",
        signal: abort.signal,
      };

      if (body !== undefined) {
        requestInit.body = body;
      }

      const response = await this.fetcher(
        this.buildUrl(options.path),
        requestInit,
      );

      if (!response.ok) {
        throw normalizeApiError(await readResponseBody(response), {
          code: mapStatusToCode(response.status),
          fallbackMessage: "Request failed.",
          requestId: response.headers.get("x-request-id") ?? undefined,
          status: response.status,
        });
      }

      return (await readResponseBody(response)) as TResponse;
    } catch (error) {
      throw normalizeApiError(error, {
        code: abort.didTimeout() ? "TIMEOUT" : "NETWORK",
        fallbackMessage: abort.didTimeout()
          ? "The request timed out."
          : "Network request failed.",
      });
    } finally {
      abort.dispose();
    }
  }

  get<TResponse>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
  ): Promise<TResponse> {
    return this.request<TResponse>({ ...options, method: "GET", path });
  }

  post<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options: Omit<ApiRequestOptions<TBody>, "body" | "method" | "path"> = {},
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>({
      ...options,
      body,
      method: "POST",
      path,
    });
  }

  patch<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options: Omit<ApiRequestOptions<TBody>, "body" | "method" | "path"> = {},
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>({
      ...options,
      body,
      method: "PATCH",
      path,
    });
  }

  resolveUrl(path: string): string {
    return this.buildUrl(path);
  }

  private buildUrl(path: string): string {
    if (/^https?:\/\//u.test(path) || this.baseUrl.length === 0) {
      return path;
    }

    return `${this.baseUrl.replace(/\/$/u, "")}/${path.replace(/^\//u, "")}`;
  }

  private async buildHeaders<TBody>(
    options: ApiRequestOptions<TBody>,
  ): Promise<Headers> {
    const headers = new Headers(this.defaultHeaders);
    headers.set("Accept", "application/json");

    if (options.headers) {
      new Headers(options.headers).forEach((value, key) => {
        headers.set(key, value);
      });
    }

    if (options.body !== undefined && !isNativeBody(options.body)) {
      headers.set("Content-Type", "application/json");
    }

    const token = await this.getAccessToken?.();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  }
}

export const apiClient = new ApiClient({
  baseUrl: publicEnv.NEXT_PUBLIC_API_BASE_URL,
  cache: "no-store",
  credentials: "include",
});

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (body instanceof FormData || body instanceof Blob) {
    return body;
  }

  if (typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
}

function isNativeBody(body: unknown): boolean {
  return (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams
  );
}

async function readResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function createTimeoutSignal(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const handleAbort = () => {
    controller.abort();
  };

  if (signal?.aborted) {
    handleAbort();
  } else {
    signal?.addEventListener("abort", handleAbort, { once: true });
  }

  return {
    didTimeout: () => timedOut,
    dispose: () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", handleAbort);
    },
    signal: controller.signal,
  };
}

function mapStatusToCode(status: number): ApiErrorCode {
  if (status === 400) {
    return "BAD_REQUEST";
  }

  if (status === 401) {
    return "UNAUTHORIZED";
  }

  if (status === 403) {
    return "FORBIDDEN";
  }

  if (status === 404) {
    return "NOT_FOUND";
  }

  if (status === 409) {
    return "CONFLICT";
  }

  if (status === 422) {
    return "VALIDATION";
  }

  if (status === 429) {
    return "RATE_LIMITED";
  }

  if (status >= 500) {
    return "SERVER";
  }

  return "UNKNOWN";
}
