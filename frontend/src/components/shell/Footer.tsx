import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-bg-surface">
      <div className="container flex flex-col gap-6 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-ink-muted">
            A practice ground for new investors. Real markets, virtual coins, no
            real-money loss.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Product
            </div>
            <Link href="/contests" className="block text-ink-muted hover:text-ink">
              Contests
            </Link>
            <Link href="/replay" className="block text-ink-muted hover:text-ink">
              Replay
            </Link>
            <Link href="/learn" className="block text-ink-muted hover:text-ink">
              Learn
            </Link>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Trust
            </div>
            <span className="block text-ink-muted">No real money</span>
            <span className="block text-ink-muted">Beginner-first design</span>
            <span className="block text-ink-muted">Skill, not gambling</span>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container py-4 text-xs text-ink-soft">
          © {new Date().getFullYear()} StonkSchool. Educational use only —
          virtual coins have no monetary value.
        </div>
      </div>
    </footer>
  );
}
