export const API_V1_PREFIX = "/v1";

export type ApiPath = `/${string}`;

function v1(path: string): ApiPath {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_V1_PREFIX}${normalized}` as ApiPath;
}

function withQuery(path: ApiPath, params: URLSearchParams): ApiPath {
  const query = params.toString();
  return query ? (`${path}?${query}` as ApiPath) : path;
}

function encodeId(id: string | number): string {
  return encodeURIComponent(String(id));
}

export const apiEndpoints = {
  auth: {
    csrf: v1("/auth/csrf"),
    devLogin: v1("/auth/dev/login"),
    devOptions: v1("/auth/dev/options"),
    login: v1("/auth/login"),
    logout: v1("/auth/logout"),
    me: v1("/auth/me"),
    ssoLogin: v1("/auth/sso/login"),
  },
  health: {
    healthz: v1("/healthz"),
    livez: v1("/livez"),
    readyz: v1("/readyz"),
  },
  lecturerPetitions: {
    attachments: (id: string | number) =>
      v1(`/petitionsLecturers/${encodeId(id)}/attachments`),
    attachmentDownload: (petitionId: string | number, attachmentId: string | number) =>
      v1(
        `/petitionsLecturers/${encodeId(petitionId)}/attachments/${encodeId(
          attachmentId,
        )}/download`,
      ),
    cancel: (id: string | number) =>
      v1(`/petitionsLecturers/${encodeId(id)}/cancel`),
    create: v1("/petitionsLecturers"),
    detail: (id: string | number) => v1(`/petitionsLecturers/${encodeId(id)}`),
    listMy: v1("/petitionsLecturers/my"),
  },
  petitionTypes: {
    list: v1("/petition-types"),
  },
  staffDashboard: {
    requests: (params: URLSearchParams) =>
      withQuery(v1("/staff-dashboard/requests"), params),
  },
  staffRequests: {
    addAttachments: (id: string | number) =>
      v1(`/staff/requests/${encodeId(id)}/attachments`),
    attachments: (id: string | number) =>
      v1(`/staff/requests/${encodeId(id)}/attachments`),
    attachmentDownload: (petitionId: string | number, attachmentId: string | number) =>
      v1(
        `/staff/requests/${encodeId(petitionId)}/attachments/${encodeId(
          attachmentId,
        )}/download`,
      ),
    detail: (id: string | number) => v1(`/staff/requests/${encodeId(id)}`),
    list: (params: URLSearchParams) => withQuery(v1("/staff/requests"), params),
    status: (id: string | number) => v1(`/staff/requests/${encodeId(id)}/status`),
  },
  studentPetitions: {
    attachments: (id: string | number) => v1(`/petitions/${encodeId(id)}/attachments`),
    attachmentDownload: (petitionId: string | number, attachmentId: string | number) =>
      v1(
        `/petitions/${encodeId(petitionId)}/attachments/${encodeId(
          attachmentId,
        )}/download`,
      ),
    cancel: (id: string | number) => v1(`/petitions/${encodeId(id)}/cancel`),
    create: v1("/petitions"),
    detail: (id: string | number) => v1(`/petitions/${encodeId(id)}`),
    listMy: v1("/petitions/my"),
  },
} as const;
