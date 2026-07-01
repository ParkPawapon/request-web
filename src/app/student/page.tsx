import { RequestList } from "@/features/request-list";
import { ProtectedRoute } from "@/processes/auth-guard";
import { DashboardLayout } from "@/widgets/dashboard-layout";

export default function StudentPage() {
  return (
    <ProtectedRoute allow={["student"]}>
      <DashboardLayout variant="student">
        <RequestList role="student" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
