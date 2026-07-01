import { describe, expect, it } from "vitest";

import { API_V1_PREFIX, apiEndpoints } from "./index";

describe("apiEndpoints", () => {
  it("centralizes new frontend contract paths under /v1", () => {
    expect(API_V1_PREFIX).toBe("/v1");
    expect(apiEndpoints.auth.me).toBe("/v1/auth/me");
    expect(apiEndpoints.studentPetitions.detail(123)).toBe("/v1/petitions/123");
    expect(apiEndpoints.lecturerPetitions.create).toBe("/v1/petitionsLecturers");
    expect(apiEndpoints.staffRequests.status(12)).toBe(
      "/v1/staff/requests/12/status",
    );
  });

  it("does not expose the legacy /api/v1 prefix", () => {
    const query = new URLSearchParams({ status: "all" });
    expect(apiEndpoints.staffDashboard.requests(query)).toBe(
      "/v1/staff-dashboard/requests?status=all",
    );
    expect(apiEndpoints.auth.logout).not.toContain("/api/v1");
  });
});
