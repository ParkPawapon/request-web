import { RequestDetail } from "@/features/request-detail";
import { ProtectedRoute } from "@/processes/auth-guard";
import { DashboardLayout } from "@/widgets/dashboard-layout";

export default function LecturerRequestDetailPage() {
  return (
    <ProtectedRoute allow={["lecturer"]}>
      <DashboardLayout variant="lecturer">
        <RequestDetail role="lecturer" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
