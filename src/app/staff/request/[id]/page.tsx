import { RequestDetail } from "@/features/request-detail";
import { ProtectedRoute } from "@/processes/auth-guard";
import { DashboardLayout } from "@/widgets/dashboard-layout";

export default function StaffRequestDetailPage() {
  return (
    <ProtectedRoute allow={["staff"]}>
      <DashboardLayout variant="staff">
        <RequestDetail staff />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
