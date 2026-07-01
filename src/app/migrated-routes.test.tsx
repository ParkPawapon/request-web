import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import LecturerPage from "./lecturer/page";
import LecturerRequestPage from "./lecturer-request/page";
import LecturerRequestDetailPage from "./lecturer/request/[id]/page";
import StaffPage from "./staff/page";
import StaffApprovedRequestPage from "./staff-request-approved/page";
import StaffPendingRequestPage from "./staff-request-pending/page";
import StaffRejectedRequestPage from "./staff-request-rejected/page";
import StaffSubmittedRequestPage from "./staff-request-submitted/page";
import StaffRequestDetailPage from "./staff/request/[id]/page";
import StudentPage from "./student/page";
import StudentRequestPage from "./student-request/page";
import StudentRequestDetailPage from "./student/request/[id]/page";

vi.mock("@/processes/auth-guard", () => ({
  ProtectedRoute: ({
    allow,
    children,
  }: {
    allow: readonly string[];
    children: ReactNode;
  }) => (
    <section data-allow={allow.join(",")} data-testid="protected-route">
      {children}
    </section>
  ),
}));

vi.mock("@/widgets/dashboard-layout", () => ({
  DashboardLayout: ({
    children,
    variant,
  }: {
    children: ReactNode;
    variant: string;
  }) => (
    <main data-testid="dashboard-layout" data-variant={variant}>
      {children}
    </main>
  ),
}));

vi.mock("@/features/request-list", () => ({
  RequestList: ({ role }: { role: string }) => (
    <div data-testid="request-list" data-role={role} />
  ),
}));

vi.mock("@/features/request-submit", () => ({
  RequestSubmissionFlow: ({ role }: { role: string }) => (
    <div data-testid="request-submit" data-role={role} />
  ),
}));

vi.mock("@/features/request-detail", () => ({
  RequestDetail: ({ role, staff }: { role?: string; staff?: boolean }) => (
    <div
      data-role={role ?? ""}
      data-staff={staff ? "true" : "false"}
      data-testid="request-detail"
    />
  ),
}));

vi.mock("@/features/staff-dashboard", () => ({
  StaffDashboard: () => <div data-testid="staff-dashboard" />,
  StaffStatusRequestList: ({ statusKey }: { statusKey: string }) => (
    <div data-status-key={statusKey} data-testid="staff-status-list" />
  ),
}));

describe("migrated routes", () => {
  it.each([
    {
      Feature: "request-list",
      Page: StudentPage,
      allow: "student",
      role: "student",
      variant: "student",
    },
    {
      Feature: "request-list",
      Page: LecturerPage,
      allow: "lecturer",
      role: "lecturer",
      variant: "lecturer",
    },
    {
      Feature: "request-submit",
      Page: StudentRequestPage,
      allow: "student",
      role: "student",
      variant: "student",
    },
    {
      Feature: "request-submit",
      Page: LecturerRequestPage,
      allow: "lecturer",
      role: "lecturer",
      variant: "lecturer",
    },
  ])(
    "composes $variant $Feature route with the matching guard and layout",
    ({ Feature, Page, allow, role, variant }) => {
      render(<Page />);

      expect(screen.getByTestId("protected-route")).toHaveAttribute(
        "data-allow",
        allow,
      );
      expect(screen.getByTestId("dashboard-layout")).toHaveAttribute(
        "data-variant",
        variant,
      );
      expect(screen.getByTestId(Feature)).toHaveAttribute("data-role", role);
    },
  );

  it("composes staff dashboard behind the staff guard", () => {
    render(<StaffPage />);

    expect(screen.getByTestId("protected-route")).toHaveAttribute(
      "data-allow",
      "staff",
    );
    expect(screen.getByTestId("dashboard-layout")).toHaveAttribute(
      "data-variant",
      "staff",
    );
    expect(screen.getByTestId("staff-dashboard")).toBeInTheDocument();
  });

  it.each([
    { Page: StaffSubmittedRequestPage, statusKey: "submitted" },
    { Page: StaffPendingRequestPage, statusKey: "pending" },
    { Page: StaffApprovedRequestPage, statusKey: "approved" },
    { Page: StaffRejectedRequestPage, statusKey: "rejected" },
  ])("composes staff status route for $statusKey", ({ Page, statusKey }) => {
    render(<Page />);

    expect(screen.getByTestId("protected-route")).toHaveAttribute(
      "data-allow",
      "staff",
    );
    expect(screen.getByTestId("staff-status-list")).toHaveAttribute(
      "data-status-key",
      statusKey,
    );
  });

  it.each([
    {
      Page: StudentRequestDetailPage,
      allow: "student",
      role: "student",
      staff: "false",
      variant: "student",
    },
    {
      Page: LecturerRequestDetailPage,
      allow: "lecturer",
      role: "lecturer",
      staff: "false",
      variant: "lecturer",
    },
    {
      Page: StaffRequestDetailPage,
      allow: "staff",
      role: "",
      staff: "true",
      variant: "staff",
    },
  ])("composes detail route for $allow", ({ Page, allow, role, staff, variant }) => {
    render(<Page />);

    expect(screen.getByTestId("protected-route")).toHaveAttribute(
      "data-allow",
      allow,
    );
    expect(screen.getByTestId("dashboard-layout")).toHaveAttribute(
      "data-variant",
      variant,
    );
    expect(screen.getByTestId("request-detail")).toHaveAttribute("data-role", role);
    expect(screen.getByTestId("request-detail")).toHaveAttribute(
      "data-staff",
      staff,
    );
  });
});
