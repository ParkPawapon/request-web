import { describe, expect, it } from "vitest";

import { normalizeInternalRedirect } from "./safe-redirect";

describe("normalizeInternalRedirect", () => {
  it("preserves internal route, query, and hash values", () => {
    expect(
      normalizeInternalRedirect("/student/request/123?tab=files#latest", "/student"),
    ).toBe("/student/request/123?tab=files#latest");
  });

  it("falls back for external or ambiguous redirect values", () => {
    expect(normalizeInternalRedirect("https://example.com", "/student")).toBe(
      "/student",
    );
    expect(normalizeInternalRedirect("//example.com/path", "/student")).toBe(
      "/student",
    );
    expect(normalizeInternalRedirect("javascript:alert(1)", "/student")).toBe(
      "/student",
    );
    expect(normalizeInternalRedirect("/\\example", "/student")).toBe("/student");
  });

  it("falls back to root when fallback is also unsafe", () => {
    expect(normalizeInternalRedirect(null, "https://example.com")).toBe("/");
  });
});
