import { RequestSubmissionFlow } from "@/features/request-submit";
import { ProtectedRoute } from "@/processes/auth-guard";
import { DashboardLayout } from "@/widgets/dashboard-layout";

export default function LecturerRequestPage() {
  return (
    <ProtectedRoute allow={["lecturer"]}>
      <DashboardLayout variant="lecturer">
        <RequestSubmissionFlow role="lecturer" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
