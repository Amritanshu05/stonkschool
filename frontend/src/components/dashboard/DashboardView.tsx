"use client";

import Link from "next/link";
import { Card, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/shell/PageHeader";
import { formatVCFixed, formatRelative, formatDateLong } from "@/lib/format";
import {
  useContests,
  useMyContests,
  useUser,
  useWallet,
  useWalletTransactions,
} from "@/lib/hooks";

export function DashboardView() {
  const { user } = useUser();
  const { data: wallet } = useWallet();
  const { data: my, isLoading: myLoading } = useMyContests();
  const { data: contests, isLoading: contestsLoading } = useContests();
  const { data: txns } = useWalletTransactions();

  const greeting = greetingFor(user?.display_name ?? "investor");
  const recommended = (contests ?? [])
    .filter((c) => c.status === "joining_open")
    .slice(0, 3);

  return (
    <div className="container py-8">
      <PageHeader
        title={greeting}
        description="A calm, focused place to practise. Try a contest, replay a market hour, or just read for ten minutes."
        actions={
          <>
            <Link href="/contests">
              <Button>Find a contest</Button>
            </Link>
            <Link href="/replay">
              <Button variant="secondary">Open replay</Button>
            </Link>
          </>
        }
      />

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <Stat
            label="Virtual wallet"
            value={
              wallet ? (
                <>
                  <span className="text-ink-soft text-base font-medium pr-1">
                    VC
                  </span>
                  {formatVCFixed(wallet.balance)}
                </>
              ) : (
                <Skeleton className="h-7 w-32" />
              )
            }
            hint="Spend on contest entries · No real-money value"
          />
        </Card>
        <Card>
          <Stat
            label="Contests played"
            value={user ? user.stats.contests_played : <Skeleton className="h-7 w-12" />}
            hint={
              user && user.stats.contests_played === 0
                ? "Play your first one — entries start at 50 VC"
                : "Across all tracks"
            }
          />
        </Card>
        <Card>
          <Stat
            label="Top-3 finishes"
            value={user ? user.stats.contests_won : <Skeleton className="h-7 w-12" />}
            hint="Counts every podium, not just first place"
            trend={user && user.stats.contests_won > 0 ? "up" : undefined}
          />
        </Card>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Your contests</CardTitle>
              <CardSubtitle>Live, locked, or recently joined.</CardSubtitle>
            </div>
            <Link
              href="/contests"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              All contests →
            </Link>
          </CardHeader>

          {myLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : my && my.length > 0 ? (
            <ul className="divide-y divide-line">
              {my.slice(0, 5).map((c) => (
                <li
                  key={c.contest_id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/contests/${c.contest_id}`}
                      className="block truncate text-sm font-semibold hover:text-brand-700"
                    >
                      {c.title}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      <Badge tone="neutral">{c.track}</Badge>
                      <StatusBadge status={c.status} />
                      <span>{formatRelative(c.start_time)} · starts</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-ink-soft">
                      {c.current_rank ? `Rank #${c.current_rank}` : "—"}
                    </div>
                    <div className="num text-sm font-semibold">
                      {c.portfolio_value != null
                        ? formatVCFixed(c.portfolio_value)
                        : "—"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="You haven't joined a contest yet"
              description="Pick a track, allocate your virtual capital, and see how you stack up."
              action={
                <Link href="/contests">
                  <Button>Browse contests</Button>
                </Link>
              }
            />
          )}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recommended</CardTitle>
              <CardSubtitle>Open to join right now.</CardSubtitle>
            </div>
          </CardHeader>

          {contestsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : recommended.length > 0 ? (
            <ul className="space-y-2">
              {recommended.map((c) => (
                <li
                  key={c.id}
                  className="rounded border border-line p-3 transition-colors hover:border-line-strong"
                >
                  <Link href={`/contests/${c.id}`} className="block">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">
                        {c.title}
                      </span>
                      <span className="num text-xs text-ink-muted">
                        {formatVCFixed(c.entry_fee)} VC
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-ink-muted">
                      Starts {formatRelative(c.start_time)} ·{" "}
                      {formatDateLong(c.start_time)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Nothing open right now"
              description="New contests open every few minutes. Check the contest list."
            />
          )}
        </Card>
      </section>

      <section className="mt-8">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Wallet activity</CardTitle>
              <CardSubtitle>Last 50 entries from your ledger.</CardSubtitle>
            </div>
          </CardHeader>

          {!txns ? (
            <Skeleton className="h-32 w-full" />
          ) : txns.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Joining a contest costs a small entry fee. Prizes are credited automatically."
            />
          ) : (
            <ul className="thin-scroll max-h-72 space-y-1 overflow-y-auto pr-2">
              {txns.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-sm px-2 py-2 text-sm hover:bg-bg-subtle"
                >
                  <div>
                    <div className="font-medium capitalize">
                      {t.type.replace("_", " ")}
                    </div>
                    <div className="text-xs text-ink-soft">
                      {formatDateLong(t.created_at)}
                    </div>
                  </div>
                  <div
                    className={
                      "num font-semibold " +
                      (Number(t.amount) >= 0 ? "text-gain" : "text-loss")
                    }
                  >
                    {Number(t.amount) >= 0 ? "+" : ""}
                    {formatVCFixed(t.amount)} VC
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}

function greetingFor(name: string): string {
  const h = new Date().getHours();
  const which =
    h < 5 ? "Up early" : h < 12 ? "Good morning" : h < 17 ? "Hello" : "Evening";
  return `${which}, ${name.split(" ")[0]}.`;
}
