import Link from "next/link";
import { TrendingUp, ExternalLink, AtSign } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-bg-surface mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green/10 border border-green/20">
                <TrendingUp className="h-3.5 w-3.5 text-green" />
              </div>
              <span className="font-semibold text-sm">
                Stonk<span className="text-green">School</span>
              </span>
            </div>
            <p className="text-xs text-ink-faint leading-relaxed">
              Learn financial markets risk-free. Compete in skill-based contests using virtual capital.
            </p>
            <p className="text-xs text-ink-faint">
              ⚠️ Simulated trading only. No real capital involved.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-ink uppercase tracking-wider">Platform</span>
              {[
                { href: "/contests", label: "Contests" },
                { href: "/replay",   label: "Market Replay" },
                { href: "/learn",    label: "Learning Hub" },
                { href: "/dashboard", label: "Dashboard" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm text-ink-muted hover:text-ink transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-ink uppercase tracking-wider">Account</span>
              {[
                { href: "/profile",  label: "Profile" },
                { href: "/login",    label: "Sign In" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm text-ink-muted hover:text-ink transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-ink uppercase tracking-wider">Connect</span>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
                              <ExternalLink className="h-3.5 w-3.5" /> GitHub
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
                              <AtSign className="h-3.5 w-3.5" /> Twitter
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-ink-faint">
            &copy; {year} StonkSchool. All rights reserved.
          </p>
          <p className="text-xs text-ink-faint">
            Built with Next.js 16 · Rust/Axum backend
          </p>
        </div>
      </div>
    </footer>
  );
}
