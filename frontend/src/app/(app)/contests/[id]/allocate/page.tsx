import { AllocateView } from "@/components/contests/AllocateView";
import { RequireAuth } from "@/components/shell/RequireAuth";

export default function AllocatePage({ params }: { params: { id: string } }) {
  return (
    <RequireAuth>
      <AllocateView contestId={params.id} />
    </RequireAuth>
  );
}
