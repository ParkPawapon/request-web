import { apiClient } from "@/shared/api/client";
import { apiEndpoints } from "@/shared/api/endpoints";

import { clearStoredMe, getStoredMe, setStoredMe } from "./me-store";
import type {
  AuthRole,
  CsrfResponse,
  DevAuthOptionsResponse,
  DevLoginRequest,
  DevLoginResponse,
  MeResponse,
  SessionUser,
} from "../model/types";

export function isStaffLike(user: SessionUser | null | undefined): boolean {
  if (!user) {
    return false;
  }

  if (user.isStaff || user.isAdmin) {
    return true;
  }

  const role = `${user.role ?? ""} ${user.roleName ?? ""}`.toLowerCase();
  if (
    role.includes("staff") ||
    role.includes("admin") ||
    role.includes("เจ้าหน้าที่") ||
    role.includes("ผู้ดูแล")
  ) {
    return true;
  }

  return Array.isArray(user.roles)
    ? user.roles.some((item) => {
        const roleName = readRoleName(item);
        return (
          roleName.includes("staff") ||
          roleName.includes("admin") ||
          roleName.includes("เจ้าหน้าที่") ||
          roleName.includes("ผู้ดูแล")
        );
      })
    : false;
}

export function getHomePathForUser(user: SessionUser | null | undefined): string {
  if (isStaffLike(user)) {
    return "/staff";
  }

  const role = String(user?.role ?? "").toLowerCase();
  if (role === "lecturer") {
    return "/lecturer";
  }

  return "/student";
}

export function isAllowedRole(
  user: SessionUser | null,
  allow: readonly AuthRole[],
): boolean {
  if (!user) {
    return false;
  }

  if (allow.length === 0) {
    return true;
  }

  if (allow.includes("staff") && isStaffLike(user)) {
    return true;
  }

  const role = String(user.role ?? "").toLowerCase();
  return allow.some((item) => item === role);
}

export async function loadCurrentUser(
  signal?: AbortSignal,
): Promise<SessionUser | null> {
  const cached = getStoredMe();
  if (cached) {
    return cached;
  }

  const response = await apiClient.get<MeResponse>(apiEndpoints.auth.me, {
    signal,
  });
  const user = response.user ?? null;
  if (user) {
    setStoredMe(user);
  }
  return user;
}

export async function refreshCurrentUser(
  signal?: AbortSignal,
): Promise<SessionUser | null> {
  const response = await apiClient.get<MeResponse>(apiEndpoints.auth.me, {
    signal,
  });
  const user = response.user ?? null;
  if (user) {
    setStoredMe(user);
  } else {
    clearStoredMe();
  }
  return user;
}

export async function getCsrfToken(signal?: AbortSignal): Promise<string> {
  const response = await apiClient.get<CsrfResponse>(apiEndpoints.auth.csrf, {
    signal,
  });
  return response.csrfToken ?? "";
}

export async function logoutSession(): Promise<void> {
  try {
    const csrfToken = await getCsrfToken();
    await apiClient.post<{ message?: string }, Record<string, never>>(
      apiEndpoints.auth.logout,
      {},
      { headers: { "x-csrf-token": csrfToken } },
    );
  } catch {
    // Legacy clears local state and redirects even when logout fails.
  } finally {
    clearStoredMe();
  }
}

export function getSsoLoginUrl(): string {
  return apiClient.resolveUrl(apiEndpoints.auth.ssoLogin);
}

export function getDevAuthOptions(
  signal?: AbortSignal,
): Promise<DevAuthOptionsResponse> {
  return apiClient.get<DevAuthOptionsResponse>(apiEndpoints.auth.devOptions, {
    signal,
  });
}

export function loginWithDevAccount(
  request: DevLoginRequest,
  csrfToken: string,
  signal?: AbortSignal,
): Promise<DevLoginResponse> {
  return apiClient.post<DevLoginResponse, DevLoginRequest>(
    apiEndpoints.auth.devLogin,
    request,
    { headers: { "x-csrf-token": csrfToken }, signal },
  );
}

function readRoleName(item: unknown): string {
  if (typeof item === "string") {
    return item.toLowerCase();
  }

  if (typeof item !== "object" || item === null) {
    return "";
  }

  const record = item as Record<string, unknown>;
  return String(
    record["name"] ?? record["roleName"] ?? record["code"] ?? "",
  ).toLowerCase();
}
