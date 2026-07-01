import { apiClient } from "@/shared/api/client";
import { apiEndpoints } from "@/shared/api/endpoints";

import {
  normalizeAttachment,
  normalizePetitionDetail,
  normalizePetitionSummary,
} from "../lib/format";
import { formatDisplayTextForRole } from "../lib/status";
import type {
  PetitionAttachment,
  PetitionAttachmentListResponse,
  PetitionDetail,
  PetitionDetailResponse,
  PetitionListResponse,
  PetitionSummary,
  PetitionType,
  PetitionTypeListResponse,
  RequestRole,
  StaffDashboardParams,
  StaffDashboardResponse,
  StaffRequestListParams,
} from "../model/types";

export async function listPetitionTypes(
  signal?: AbortSignal,
): Promise<readonly PetitionType[]> {
  const response = await apiClient.get<PetitionTypeListResponse>(
    apiEndpoints.petitionTypes.list,
    { signal },
  );

  return response.data
    .map(normalizePetitionType)
    .filter((item): item is PetitionType => item !== null);
}

export async function listMyPetitions(
  role: RequestRole,
  signal?: AbortSignal,
): Promise<readonly PetitionSummary[]> {
  const endpoint =
    role === "lecturer"
      ? apiEndpoints.lecturerPetitions.listMy
      : apiEndpoints.studentPetitions.listMy;

  const response = await apiClient.get<PetitionListResponse>(endpoint, {
    signal,
  });

  return response.data
    .map(normalizePetitionSummary)
    .filter((item): item is PetitionSummary => item !== null)
    .map((item) => ({
      ...item,
      title: formatDisplayTextForRole(item.title, role),
    }));
}

export async function createPetition(
  role: RequestRole,
  formData: FormData,
  csrfToken: string,
  signal?: AbortSignal,
): Promise<unknown> {
  const endpoint =
    role === "lecturer"
      ? apiEndpoints.lecturerPetitions.create
      : apiEndpoints.studentPetitions.create;

  return apiClient.post<unknown, FormData>(endpoint, formData, {
    headers: { "x-csrf-token": csrfToken },
    signal,
  });
}

export async function getPetitionDetail(
  role: RequestRole,
  id: string,
  signal?: AbortSignal,
): Promise<PetitionDetail | null> {
  const endpoint =
    role === "lecturer"
      ? apiEndpoints.lecturerPetitions.detail(id)
      : apiEndpoints.studentPetitions.detail(id);

  const response = await apiClient.get<PetitionDetailResponse>(endpoint, {
    signal,
  });
  return normalizePetitionDetail(response.data);
}

export async function listPetitionAttachments(
  role: RequestRole,
  id: string,
  signal?: AbortSignal,
): Promise<readonly PetitionAttachment[]> {
  const endpoint =
    role === "lecturer"
      ? apiEndpoints.lecturerPetitions.attachments(id)
      : apiEndpoints.studentPetitions.attachments(id);

  const response = await apiClient.get<PetitionAttachmentListResponse>(
    endpoint,
    { signal },
  );

  return response.data
    .map(normalizeAttachment)
    .filter((item): item is PetitionAttachment => item !== null);
}

export async function cancelPetition(
  role: RequestRole,
  id: string,
  csrfToken: string,
): Promise<unknown> {
  const endpoint =
    role === "lecturer"
      ? apiEndpoints.lecturerPetitions.cancel(id)
      : apiEndpoints.studentPetitions.cancel(id);

  return apiClient.post<unknown, Record<string, never>>(endpoint, {}, {
    headers: { "x-csrf-token": csrfToken },
  });
}

export async function listStaffRequests(
  params: StaffRequestListParams,
  signal?: AbortSignal,
): Promise<readonly PetitionSummary[]> {
  const query = new URLSearchParams();
  query.set("status", params.status);
  query.set("submittedType", params.submittedType ?? "all");
  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 50));
  query.set("sortBy", params.sortBy ?? "submittedAt");
  query.set("sortDir", params.sortDir ?? "desc");
  if (params.q) query.set("q", params.q);

  const response = await apiClient.get<PetitionListResponse>(
    apiEndpoints.staffRequests.list(query),
    { signal },
  );

  return response.data
    .map(normalizePetitionSummary)
    .filter((item): item is PetitionSummary => item !== null);
}

export async function listStaffDashboard(
  params: StaffDashboardParams,
  signal?: AbortSignal,
): Promise<StaffDashboardResponse> {
  const query = new URLSearchParams();
  query.set("roleView", params.roleView);
  query.set("sortBy", params.sortBy);
  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));
  query.set("status", params.status);
  if (params.q) query.set("q", params.q);

  return apiClient.get<StaffDashboardResponse>(
    apiEndpoints.staffDashboard.requests(query),
    { signal },
  );
}

export async function getStaffPetitionDetail(
  id: string,
  signal?: AbortSignal,
): Promise<PetitionDetail | null> {
  const response = await apiClient.get<PetitionDetailResponse>(
    apiEndpoints.staffRequests.detail(id),
    { signal },
  );
  return normalizePetitionDetail(response.data);
}

export async function listStaffPetitionAttachments(
  id: string,
  signal?: AbortSignal,
): Promise<readonly PetitionAttachment[]> {
  const response = await apiClient.get<PetitionAttachmentListResponse>(
    apiEndpoints.staffRequests.attachments(id),
    { signal },
  );

  return response.data
    .map(normalizeAttachment)
    .filter((item): item is PetitionAttachment => item !== null);
}

export async function updateStaffPetitionStatus(
  id: string,
  body: Readonly<{
    currentStage?: string;
    note?: string;
    overallStatus: string;
  }>,
  csrfToken: string,
): Promise<unknown> {
  return apiClient.patch<unknown, typeof body>(
    apiEndpoints.staffRequests.status(id),
    body,
    { headers: { "x-csrf-token": csrfToken } },
  );
}

export async function uploadStaffAttachments(
  id: string,
  formData: FormData,
  csrfToken: string,
): Promise<unknown> {
  return apiClient.post<unknown, FormData>(
    apiEndpoints.staffRequests.addAttachments(id),
    formData,
    { headers: { "x-csrf-token": csrfToken } },
  );
}

function normalizePetitionType(input: unknown): PetitionType | null {
  if (typeof input !== "object" || input === null) return null;
  const record = input as Record<string, unknown>;
  const petitionTypeID = String(record["petitionTypeID"] ?? record["id"] ?? "");
  const petitionTypeName = String(record["petitionTypeName"] ?? record["name"] ?? "");
  if (!petitionTypeID || !petitionTypeName) return null;
  return { petitionTypeID, petitionTypeName };
}
