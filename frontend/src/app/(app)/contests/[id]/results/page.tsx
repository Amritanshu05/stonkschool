import { ResultsView } from "@/components/contests/ResultsView";
import { RequireAuth } from "@/components/shell/RequireAuth";

export default function ResultsPage({ params }: { params: { id: string } }) {
  return (
    <RequireAuth>
      <ResultsView contestId={params.id} />
    </RequireAuth>
  );
}
