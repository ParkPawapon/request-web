import { StaffStatusRequestList } from "@/features/staff-dashboard";
import { ProtectedRoute } from "@/processes/auth-guard";
import { DashboardLayout } from "@/widgets/dashboard-layout";

export default function StaffRejectedRequestPage() {
  return (
    <ProtectedRoute allow={["staff"]}>
      <DashboardLayout variant="staff">
        <StaffStatusRequestList statusKey="rejected" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
