"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { formatVCFixed } from "@/lib/format";
import { useUser, useWallet } from "@/lib/hooks";
import { api, API_URL } from "@/lib/api";

const NAV = [
  { href: "/dashboard", label: "Home" },
  { href: "/contests", label: "Contests" },
  { href: "/replay", label: "Replay" },
  { href: "/learn", label: "Learn" },
];

export function AppHeader() {
  const pathname = usePathname() ?? "";
  const { user, isLoading } = useUser();
  const { data: wallet } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg-surface/85 backdrop-blur">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/dashboard" className="flex items-center" aria-label="Home">
          <Logo />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-ink bg-bg-subtle"
                    : "text-ink-muted hover:text-ink hover:bg-bg-subtle",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {wallet ? (
            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-sm border border-line bg-bg-surface px-3 py-1.5 text-sm hover:border-line-strong sm:inline-flex"
              title="Virtual wallet"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              <span className="text-ink-muted">VC</span>
              <span className="num font-semibold text-ink">
                {formatVCFixed(wallet.balance)}
              </span>
            </Link>
          ) : (
            <Skeleton className="hidden h-8 w-32 rounded sm:block" />
          )}

          {isLoading ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : user ? (
            <button
              type="button"
              className="ss-focus rounded-full"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Account menu"
            >
              <Avatar name={user.display_name} />
            </button>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </div>

      {menuOpen && user ? (
        <UserMenu
          name={user.display_name}
          email={user.email}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}
    </header>
  );
}

function UserMenu({
  name,
  email,
  onClose,
}: {
  name: string;
  email: string;
  onClose: () => void;
}) {
  async function logout() {
    try {
      await api("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // best-effort
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <>
      <button
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-transparent"
      />
      <div className="absolute right-4 top-14 z-50 w-64 rounded-md border border-line bg-bg-surface shadow-pop animate-fade-in">
        <div className="flex items-center gap-3 p-4">
          <Avatar name={name} size="lg" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{name}</div>
            <div className="truncate text-xs text-ink-muted">{email}</div>
          </div>
        </div>
        <div className="ss-divider" />
        <div className="p-2">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="block rounded-sm px-3 py-2 text-sm hover:bg-bg-subtle"
          >
            Dashboard
          </Link>
          <a
            href={`${API_URL}/api/v1/auth/google`}
            className="block rounded-sm px-3 py-2 text-sm hover:bg-bg-subtle"
          >
            Re-link Google account
          </a>
          <button
            onClick={logout}
            className="block w-full rounded-sm px-3 py-2 text-left text-sm text-loss hover:bg-loss-soft"
          >
            Log out
          </button>
        </div>
      </div>
    </>
  );
}
