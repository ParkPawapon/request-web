import { describe, expect, it } from "vitest";

import {
  API_V1_PREFIX,
  apiEndpoints,
  normalizeApiPath,
} from "./index";

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

  it("maps legacy /api/v1 paths to the new frontend v1 contract", () => {
    expect(normalizeApiPath("/api/v1/staff/requests/12/attachments")).toBe(
      "/v1/staff/requests/12/attachments",
    );
    expect(normalizeApiPath("/v1/auth/me")).toBe("/v1/auth/me");
  });

  it("rejects unsafe or non-contract API paths", () => {
    expect(normalizeApiPath("https://example.com/v1/auth/me")).toBe("#");
    expect(normalizeApiPath("//example.com/v1/auth/me")).toBe("#");
    expect(normalizeApiPath("/api/private")).toBe("#");
    expect(normalizeApiPath("/v2/auth/me")).toBe("#");
    expect(normalizeApiPath("/v1\\auth\\me")).toBe("#");
  });
});
