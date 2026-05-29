"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Trophy,
  Users,
  BarChart2,
  Settings,
  Activity,
  TrendingUp,
  Clock,
  Eye,
} from "lucide-react";
import Link from "next/link";

function AdminStatCard({
  icon: Icon,
  label,
  value,
  iconClass,
  iconBg,
}: {
  icon: any;
  label: string;
  value: string | number;
  iconClass: string;
  iconBg: string;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconClass}`} />
      </div>
      <div>
        <p className="text-xs text-ink-faint uppercase tracking-wider">{label}</p>
        <p className="num text-2xl font-bold text-ink">{value}</p>
      </div>
    </Card>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"contests" | "participants">("contests");

  const { data: contests, isLoading } = useQuery({
    queryKey: ["contests"],
    queryFn: api.contests.list,
  });

  const live = contests?.filter((c) => c.status === "live").length ?? 0;
  const upcoming = contests?.filter((c) => c.status === "upcoming").length ?? 0;
  const ended = contests?.filter((c) => c.status === "ended").length ?? 0;
  const total = contests?.length ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Settings className="h-6 w-6 text-green" />
            Admin Panel
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Contest management &amp; platform monitoring
          </p>
        </div>
        <Badge variant="amber" size="lg" dot>Admin Access</Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard icon={Trophy}    label="Total Contests"    value={total}   iconClass="text-amber" iconBg="bg-amber/10" />
        <AdminStatCard icon={Activity}  label="Live Now"          value={live}    iconClass="text-green" iconBg="bg-green/10" />
        <AdminStatCard icon={Clock}     label="Upcoming"          value={upcoming} iconClass="text-blue"  iconBg="bg-blue/10" />
        <AdminStatCard icon={BarChart2} label="Completed"         value={ended}   iconClass="text-ink-muted" iconBg="bg-bg-subtle" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-line">
        {(["contests", "participants"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 ${
              activeTab === tab
                ? "border-green text-green"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contests Table */}
      {activeTab === "contests" && (
        <Card padding="none">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <h2 className="font-semibold text-sm text-ink">All Contests</h2>
            <Button size="sm" variant="outline">
              + New Contest
            </Button>
          </div>
          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-bg-subtle animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-bg-subtle/50">
                    <th className="px-5 py-3 text-left text-[10px] text-ink-faint uppercase tracking-wider font-medium">Title</th>
                    <th className="px-5 py-3 text-left text-[10px] text-ink-faint uppercase tracking-wider font-medium">Track</th>
                    <th className="px-5 py-3 text-left text-[10px] text-ink-faint uppercase tracking-wider font-medium">Status</th>
                    <th className="px-5 py-3 text-left text-[10px] text-ink-faint uppercase tracking-wider font-medium">Entry Fee</th>
                    <th className="px-5 py-3 text-left text-[10px] text-ink-faint uppercase tracking-wider font-medium">Starts</th>
                    <th className="px-5 py-3 text-right text-[10px] text-ink-faint uppercase tracking-wider font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {contests?.map((c) => (
                    <tr key={c.id} className="hover:bg-bg-subtle/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-ink">{c.title}</td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={c.track === "crypto" ? "green" : c.track === "etf" ? "amber" : "blue"}
                          size="sm"
                        >
                          {c.track.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={c.status === "live" ? "green" : c.status === "upcoming" ? "amber" : "outline"}
                          size="sm"
                          dot={c.status === "live"}
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 num text-ink-muted">
                        {formatCurrency(c.entry_fee, "V")}
                      </td>
                      <td className="px-5 py-3.5 num text-xs text-ink-muted">
                        {formatDateTime(c.start_time)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/contests/${c.id}`}>
                            <Button variant="ghost" size="icon-sm">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          {c.status === "live" && (
                            <Link href={`/contests/${c.id}/live`}>
                              <Button variant="ghost" size="icon-sm">
                                <Activity className="h-3.5 w-3.5 text-green" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Participants Tab */}
      {activeTab === "participants" && (
        <Card className="flex flex-col items-center justify-center py-16 gap-3">
          <Users className="h-10 w-10 text-ink-faint" />
          <p className="font-medium text-ink">Participant Management</p>
          <p className="text-sm text-ink-muted text-center max-w-xs">
            Detailed participant data requires admin-level API endpoints (to be implemented).
          </p>
        </Card>
      )}
    </div>
  );
}
