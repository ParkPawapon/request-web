import { RequestSubmissionFlow } from "@/features/request-submit";
import { ProtectedRoute } from "@/processes/auth-guard";
import { DashboardLayout } from "@/widgets/dashboard-layout";

export default function StudentRequestPage() {
  return (
    <ProtectedRoute allow={["student"]}>
      <DashboardLayout variant="student">
        <RequestSubmissionFlow role="student" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
