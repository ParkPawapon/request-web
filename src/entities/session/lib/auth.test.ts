import { describe, expect, it } from "vitest";

import { getHomePathForUser, isAllowedRole, isStaffLike } from "./auth";

describe("auth role helpers", () => {
  it("preserves staff-like role detection", () => {
    expect(isStaffLike({ id: "1", role: "staff" })).toBe(true);
    expect(isStaffLike({ id: "1", roleName: "ผู้ดูแลระบบ" })).toBe(true);
    expect(isStaffLike({ id: "1", role: "student" })).toBe(false);
  });

  it("routes allowed users to legacy home paths", () => {
    expect(getHomePathForUser({ id: "s1", role: "student" })).toBe("/student");
    expect(getHomePathForUser({ id: "l1", role: "lecturer" })).toBe(
      "/lecturer",
    );
    expect(getHomePathForUser({ id: "st1", role: "staff" })).toBe("/staff");
    expect(isAllowedRole({ id: "st1", role: "admin" }, ["staff"])).toBe(true);
  });
});
