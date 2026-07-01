import { StaffStatusRequestList } from "@/features/staff-dashboard";
import { ProtectedRoute } from "@/processes/auth-guard";
import { DashboardLayout } from "@/widgets/dashboard-layout";

export default function StaffSubmittedRequestPage() {
  return (
    <ProtectedRoute allow={["staff"]}>
      <DashboardLayout variant="staff">
        <StaffStatusRequestList statusKey="submitted" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
