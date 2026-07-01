import { RequestDetail } from "@/features/request-detail";
import { ProtectedRoute } from "@/processes/auth-guard";
import { DashboardLayout } from "@/widgets/dashboard-layout";

export default function StudentRequestDetailPage() {
  return (
    <ProtectedRoute allow={["student"]}>
      <DashboardLayout variant="student">
        <RequestDetail role="student" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
