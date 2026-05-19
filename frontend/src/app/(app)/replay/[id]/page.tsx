import { ReplaySession } from "@/components/replay/ReplaySession";
import { RequireAuth } from "@/components/shell/RequireAuth";

export default function ReplaySessionPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { symbol?: string };
}) {
  return (
    <RequireAuth>
      <ReplaySession
        replayId={params.id}
        symbol={searchParams.symbol ?? "—"}
      />
    </RequireAuth>
  );
}
