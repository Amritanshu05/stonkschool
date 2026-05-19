import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingTrust } from "@/components/landing/LandingTrust";
import { Footer } from "@/components/shell/Footer";
import { API_URL } from "@/lib/api";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg-surface/85 backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link href="/" aria-label="StonkSchool home">
            <Logo />
          </Link>
          <nav className="ml-8 hidden items-center gap-1 md:flex">
            <Link
              href="/contests"
              className="rounded-sm px-3 py-2 text-sm font-medium text-ink-muted hover:bg-bg-subtle hover:text-ink"
            >
              Contests
            </Link>
            <Link
              href="/replay"
              className="rounded-sm px-3 py-2 text-sm font-medium text-ink-muted hover:bg-bg-subtle hover:text-ink"
            >
              Replay
            </Link>
            <Link
              href="/learn"
              className="rounded-sm px-3 py-2 text-sm font-medium text-ink-muted hover:bg-bg-subtle hover:text-ink"
            >
              Learn
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <a href={`${API_URL}/api/v1/auth/google`}>
              <Button size="sm">Get started</Button>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingTrust />
      </main>

      <Footer />
    </div>
  );
}
