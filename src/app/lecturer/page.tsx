import { RequestList } from "@/features/request-list";
import { ProtectedRoute } from "@/processes/auth-guard";
import { DashboardLayout } from "@/widgets/dashboard-layout";

export default function LecturerPage() {
  return (
    <ProtectedRoute allow={["lecturer"]}>
      <DashboardLayout variant="lecturer">
        <RequestList role="lecturer" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
