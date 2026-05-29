"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  BookOpen,
  Trophy,
  PlayCircle,
  User,
  LogOut,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ─── Ticker Tape ─────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { symbol: "BTC", price: "₹58,24,301", change: "+2.14%" },
  { symbol: "ETH", price: "₹3,12,450", change: "+1.07%" },
  { symbol: "NIFTY", price: "24,218", change: "-0.32%" },
  { symbol: "SENSEX", price: "79,801", change: "-0.28%" },
  { symbol: "GOLD", price: "₹74,520", change: "+0.91%" },
  { symbol: "AAPL", price: "$186.40", change: "+0.55%" },
  { symbol: "TSLA", price: "$248.10", change: "+3.21%" },
  { symbol: "RELIANCE", price: "₹2,954", change: "+0.73%" },
];

function TickerTape() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-b border-line bg-bg-elevated/60 backdrop-blur-sm h-7 flex items-center">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-2 px-6 whitespace-nowrap">
            <span className="font-semibold text-xs text-ink num">{item.symbol}</span>
            <span className="text-xs text-ink-muted num">{item.price}</span>
            <span
              className={cn(
                "text-xs num",
                item.change.startsWith("+") ? "text-green" : "text-red"
              )}
            >
              {item.change}
            </span>
            <span className="text-line mx-1">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Nav Links ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: "/contests",  label: "Contests",  icon: Trophy },
  { href: "/replay",   label: "Replay",    icon: PlayCircle },
  { href: "/learn",    label: "Learn",     icon: BookOpen },
  { href: "/dashboard", label: "Dashboard", icon: BarChart2, auth: true },
];

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group" aria-label="StonkSchool home">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-green/10 border border-green/20 transition-all group-hover:border-green/50">
        <TrendingUp className="h-4 w-4 text-green" />
      </div>
      <span className="font-semibold text-base tracking-tight">
        Stonk<span className="text-green">School</span>
      </span>
    </Link>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: api.users.me,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
    },
  });

  const isAuthed = !!user;

  return (
    <>
      <TickerTape />
      <header className="sticky top-0 z-50 border-b border-line bg-bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Logo />

          {/* Desktop Nav */}
          <nav className="ml-6 hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.filter((l) => !l.auth || isAuthed).map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-green/10 text-green"
                      : "text-ink-muted hover:bg-bg-subtle hover:text-ink"
                  )}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />

            {isAuthed ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="icon-sm">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => logoutMutation.mutate()}
                  loading={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <a href={api.auth.googleUrl}>
                <Button size="sm">Get Started</Button>
              </a>
            )}

            {/* Mobile hamburger */}
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-bg-subtle md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-4 w-4 text-ink-muted" />
              ) : (
                <Menu className="h-4 w-4 text-ink-muted" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-line bg-bg-surface px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.filter((l) => !l.auth || isAuthed).map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-green/10 text-green"
                        : "text-ink-muted hover:bg-bg-subtle hover:text-ink"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
