import { LiveContestView } from "@/components/contests/LiveContestView";
import { RequireAuth } from "@/components/shell/RequireAuth";

export default function LiveContestPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <RequireAuth>
      <LiveContestView contestId={params.id} />
    </RequireAuth>
  );
}
