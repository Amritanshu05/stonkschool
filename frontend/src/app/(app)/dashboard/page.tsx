import { DashboardView } from "@/components/dashboard/DashboardView";
import { RequireAuth } from "@/components/shell/RequireAuth";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardView />
    </RequireAuth>
  );
}
