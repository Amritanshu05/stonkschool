import { ContestDetailView } from "@/components/contests/ContestDetailView";

export default function ContestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ContestDetailView contestId={params.id} />;
}
