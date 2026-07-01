import type { ApiSuccess } from "@/shared/api/types";

export type RequestRole = "lecturer" | "student";
export type StaffRoleView = "all" | "lecturer" | "student";

export type NormalizedStatus =
  | "approved"
  | "cancelled"
  | "processing"
  | "rejected"
  | "submitted"
  | "unknown";

export type PetitionType = Readonly<{
  petitionTypeID: string;
  petitionTypeName: string;
}>;

export type PetitionSummary = Readonly<{
  createdAt: string | null;
  fullName?: string;
  id: string;
  status: string;
  submittedType?: StaffRoleView;
  title: string;
}>;

export type PetitionDetail = Readonly<{
  annotation?: string | null;
  closedAt?: string | null;
  createdAt?: string | null;
  currentStage?: string | null;
  id?: string | number | null;
  overallStatus?: string | null;
  petitionID?: string | number | null;
  petitionId?: string | number | null;
  petitionTypeName?: string | null;
  ptSemester?: string | number | null;
  ptYear?: string | number | null;
  requesterName?: string | null;
  requesterRole?: string | null;
  status?: string | null;
  submittedAt?: string | null;
  submittedType?: string | null;
  updatedAt?: string | null;
}>;

export type PetitionAttachment = Readonly<{
  attachmentID?: string | number | null;
  bytesize?: number | string | null;
  contentType?: string | null;
  createdAt?: string | null;
  downloadPath?: string | null;
  fileName?: string | null;
  id?: string | number | null;
  uploadedByType?: string | null;
}>;

export type StaffDashboardRow = Readonly<{
  createdAt: string | null;
  id: string;
  requesterName: string;
  requesterRole: StaffRoleView;
  statusKey?: NormalizedStatus;
  statusText: string;
  title: string;
}>;

export type StaffDashboardKpi = Readonly<{
  approved: number;
  processing: number;
  rejected: number;
  submitted: number;
  total: number;
}>;

export type StaffDashboardTrendPoint = Readonly<{
  count: number;
  date: string;
}>;

export type StaffDashboardMeta = Readonly<{
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}>;

export type StaffDashboardResponse = Readonly<{
  data?: readonly StaffDashboardRow[];
  kpi?: StaffDashboardKpi;
  last7?: readonly StaffDashboardTrendPoint[];
  meta?: StaffDashboardMeta;
}>;

export type StaffRequestListParams = Readonly<{
  page?: number;
  pageSize?: number;
  q?: string;
  sortBy?: "createdAt" | "submittedAt" | "updatedAt";
  sortDir?: "asc" | "desc";
  status: string;
  submittedType?: StaffRoleView;
}>;

export type StaffDashboardParams = Readonly<{
  page: number;
  pageSize: 10 | 25 | 50;
  q?: string;
  roleView: StaffRoleView;
  sortBy: "latest" | "oldest" | "status";
  status: "all" | "approved" | "processing" | "rejected" | "submitted";
}>;

export type PetitionListResponse = ApiSuccess<readonly unknown[]>;
export type PetitionTypeListResponse = ApiSuccess<readonly unknown[]>;
export type PetitionDetailResponse = ApiSuccess<unknown>;
export type PetitionAttachmentListResponse = ApiSuccess<readonly unknown[]>;
