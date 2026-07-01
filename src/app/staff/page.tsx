import { StaffDashboard } from "@/features/staff-dashboard";
import { ProtectedRoute } from "@/processes/auth-guard";
import { DashboardLayout } from "@/widgets/dashboard-layout";

export default function StaffPage() {
  return (
    <ProtectedRoute allow={["staff"]}>
      <DashboardLayout variant="staff">
        <StaffDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
