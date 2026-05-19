import { ReplayLanding } from "@/components/replay/ReplayLanding";
import { RequireAuth } from "@/components/shell/RequireAuth";

export default function ReplayPage() {
  return (
    <RequireAuth>
      <ReplayLanding />
    </RequireAuth>
  );
}
