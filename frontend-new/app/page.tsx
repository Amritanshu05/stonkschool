import type { Metadata } from "next";
import { Navbar } from "@/components/shell/navbar";
import { Footer } from "@/components/shell/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  TrendingUp,
  Shield,
  Zap,
  Trophy,
  PlayCircle,
  BookOpen,
  ArrowRight,
  BarChart2,
  Lock,
  Users,
  ChevronRight,
  Activity,
  Globe,
  PieChart,
  LineChart
} from "lucide-react";

export const metadata: Metadata = {
  title: "StonkSchool — Learn Trading Without Risk",
  description:
    "Master financial markets with zero risk. Replay historical data, compete in skill-based contests, and learn investing using virtual capital.",
};

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
      {/* Background grid */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="h-[500px] w-[800px] rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(ellipse, var(--green) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
        {/* Pill badge */}
        <div className="mb-8 inline-flex">
          <Badge variant="green" size="lg" dot className="gap-2">
            <span className="animate-pulse">●</span>
            Live Markets · Zero Real Risk
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-5xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
          Trade Markets Like a{" "}
          <span className="gradient-text">Pro</span>
          {" "}Without Losing a{" "}
          <span className="gradient-text">Rupee</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-ink-muted leading-relaxed">
          StonkSchool gives you a risk-free arena to replay historical markets,
          sharpen strategies, and compete in skill-based contests — all powered
          by virtual coins.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href={api.auth.googleUrl}>
            <Button size="xl" className="w-full sm:w-auto glow-green group">
              Start for Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </a>
          <Link href="/contests">
            <Button variant="outline" size="xl" className="w-full sm:w-auto">
              Browse Contests
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 mb-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {[
            { label: "Virtual Capital", value: "₹1,00,000" },
            { label: "Contest Tracks", value: "3 Markets" },
            { label: "Real Data", value: "Live + History" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="num text-2xl font-bold text-ink">{s.value}</div>
              <div className="text-xs text-ink-faint mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Dashboard Preview (New effect) */}
        <div className="relative mx-auto max-w-5xl mt-12 transition-transform duration-1000 ease-out hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
          <div className="glass rounded-2xl p-2 shadow-2xl overflow-hidden border border-line/50">
            <div className="bg-bg-elevated rounded-xl border border-line overflow-hidden flex flex-col h-[400px]">
              {/* Mock Header */}
              <div className="flex items-center justify-between p-4 border-b border-line bg-bg-surface/50">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex gap-4 text-xs font-mono text-ink-muted">
                  <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-green" /> BTC/USD 58,240.00</span>
                  <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-green" /> ETH/USD 3,105.50</span>
                </div>
              </div>
              {/* Mock Body */}
              <div className="flex-1 flex flex-col sm:flex-row p-4 gap-4">
                <div className="w-full sm:w-2/3 border border-line rounded-lg bg-bg-subtle/30 relative overflow-hidden flex items-end">
                   {/* Fake chart lines */}
                   <svg className="w-full h-full opacity-30 text-green" preserveAspectRatio="none" viewBox="0 0 100 100">
                     <path d="M0,100 L0,50 L10,60 L20,40 L30,55 L40,30 L50,45 L60,20 L70,35 L80,10 L90,25 L100,5 L100,100 Z" fill="currentColor" opacity="0.2" />
                     <path d="M0,50 L10,60 L20,40 L30,55 L40,30 L50,45 L60,20 L70,35 L80,10 L90,25 L100,5" fill="none" stroke="currentColor" strokeWidth="2" />
                   </svg>
                   <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated to-transparent" />
                </div>
                <div className="w-full sm:w-1/3 flex flex-col gap-4">
                  <div className="flex-1 border border-line rounded-lg p-4 bg-bg-subtle/30 text-left">
                    <div className="text-xs text-ink-faint uppercase tracking-wider mb-2">Portfolio Value</div>
                    <div className="text-2xl font-mono font-bold text-green drop-shadow-[0_0_8px_rgba(0,166,81,0.5)]">₹1,05,420.50</div>
                    <div className="text-xs text-green mt-1">+5.42% All Time</div>
                  </div>
                  <div className="flex-1 border border-line rounded-lg p-4 bg-bg-subtle/30 text-left">
                     <div className="text-xs text-ink-faint uppercase tracking-wider mb-2">Live Rank</div>
                     <div className="text-4xl font-mono font-bold text-amber">#1</div>
                     <div className="text-xs text-ink-muted mt-1">Crypto Alpha Contest</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ─── Feature Cards (Bento Grid) ───────────────────────────────────────────────
const FEATURES = [
  {
    icon: PlayCircle,
    color: "text-green",
    bg: "bg-green/10",
    title: "Market Replay Engine",
    desc: "Stream historical OHLC data on demand. Pause, fast-forward, and trade in a fully controlled time environment.",
    colSpan: "sm:col-span-2 lg:col-span-2",
  },
  {
    icon: Trophy,
    color: "text-amber",
    bg: "bg-amber/10",
    title: "Skill-Based Contests",
    desc: "Equal virtual capital for everyone. Pre-commit your portfolio weights and let the market decide the winner.",
    colSpan: "sm:col-span-1",
  },
  {
    icon: Lock,
    color: "text-blue",
    bg: "bg-blue/10",
    title: "Pre-Commit Allocation",
    desc: "Lock your allocations before the contest starts. No last-second changes. Pure skill, pure fairness.",
    colSpan: "sm:col-span-1",
  },
  {
    icon: Zap,
    color: "text-green",
    bg: "bg-green/10",
    title: "Real-Time WebSockets",
    desc: "Live leaderboard updates, streaming price data, and replay charts — all via persistent WebSocket connections.",
    colSpan: "sm:col-span-1",
  },
  {
    icon: BookOpen,
    color: "text-amber",
    bg: "bg-amber/10",
    title: "Learning Hub",
    desc: "Structured modules on crypto, ETFs, equities, and trading strategies — with direct links to practice.",
    colSpan: "sm:col-span-2 lg:col-span-1",
  },
];

function Features() {
  return (
    <section className="py-20 sm:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg-elevated/20 to-bg pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-14">
          <Badge variant="outline" size="md" className="mb-4">Platform Features</Badge>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything you need to{" "}
            <span className="gradient-text">master markets</span>
          </h2>
          <p className="mt-4 text-ink-muted max-w-xl mx-auto">
            A full-stack trading education platform with live data, real-time competition, and zero financial risk.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(180px,auto)]">
          {FEATURES.map((f, i) => (
            <Card
              key={f.title}
              className={`group overflow-hidden hover:border-line/80 hover:-translate-y-1 transition-all duration-300 relative ${f.colSpan}`}
            >
              <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                <f.icon className="w-40 h-40" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bg} group-hover:scale-110 transition-transform`}>
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg text-ink mb-2">{f.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed max-w-md">{f.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Sign in with Google",
    desc: "One click. Your profile, wallet (₹1,00,000 virtual), and stats are auto-created.",
    icon: Users,
  },
  {
    step: "02",
    title: "Browse & Join Contests",
    desc: "Pick a track — Crypto, ETF, or Equities. Pay the entry fee from your virtual wallet.",
    icon: Trophy,
  },
  {
    step: "03",
    title: "Lock Your Allocation",
    desc: "Distribute your capital across assets using sliders. Lock it before the contest starts.",
    icon: Lock,
  },
  {
    step: "04",
    title: "Watch the Leaderboard",
    desc: "Markets run live. Your portfolio value updates in real time via WebSockets.",
    icon: BarChart2,
  },
];

function HowItWorks() {
  return (
    <section className="py-20 sm:py-28 bg-bg-elevated/50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge variant="outline" size="md" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl font-bold sm:text-4xl">
            From zero to competing in{" "}
            <span className="gradient-text">4 steps</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-8 left-0 right-0 hidden lg:block">
            <div className="mx-auto max-w-4xl h-px bg-gradient-to-r from-transparent via-line to-transparent" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="relative flex flex-col items-center text-center gap-5 group">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-surface border border-line shadow-sm group-hover:border-green/50 group-hover:shadow-[0_0_15px_rgba(0,166,81,0.2)] transition-all">
                  <step.icon className="h-6 w-6 text-green group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green text-bg text-xs font-bold shadow-md">
                    {step.step}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-ink mb-2">{step.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Contest Tracks ───────────────────────────────────────────────────────────
const TRACKS = [
  {
    id: "crypto",
    label: "Crypto",
    badge: "green" as const,
    desc: "BTC, ETH, SOL and more. High volatility, high excitement.",
    gradient: "from-green/10 via-transparent to-transparent hover:from-green/20",
    icon: Globe,
  },
  {
    id: "etf",
    label: "ETFs",
    badge: "amber" as const,
    desc: "Index funds, sector ETFs. Steady returns, diversified exposure.",
    gradient: "from-amber/10 via-transparent to-transparent hover:from-amber/20",
    icon: PieChart,
  },
  {
    id: "equity",
    label: "Equities",
    badge: "blue" as const,
    desc: "Nifty 50, individual stocks. The classic trading battleground.",
    gradient: "from-blue/10 via-transparent to-transparent hover:from-blue/20",
    icon: LineChart,
  },
];

function Tracks() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-14">
          <Badge variant="outline" size="md" className="mb-4">Contest Tracks</Badge>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Three arenas.{" "}
            <span className="gradient-text">One skill to prove.</span>
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {TRACKS.map((t) => (
            <Link key={t.id} href={`/contests?track=${t.id}`}>
              <Card
                className={`h-full group bg-gradient-to-br ${t.gradient} hover:border-line/80 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden relative`}
              >
                <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                  <t.icon className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant={t.badge} size="lg">{t.label}</Badge>
                    <div className="h-8 w-8 rounded-full bg-bg-surface flex items-center justify-center border border-line">
                      <ChevronRight className="h-4 w-4 text-ink-faint group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                  <p className="text-sm text-ink-muted">{t.desc}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CtaBanner() {
  return (
    <section className="py-20 sm:py-28 bg-bg-elevated/30">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <div className="relative rounded-3xl border border-green/20 bg-bg-surface p-12 overflow-hidden shadow-[0_0_40px_rgba(0,166,81,0.05)]">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, var(--green) 0%, transparent 60%)" }}
          />
          <div className="relative z-10">
            <Activity className="mx-auto mb-6 h-12 w-12 text-green animate-pulse" />
            <h2 className="text-3xl font-bold sm:text-4xl mb-4 tracking-tight">
              Ready to prove your edge?
            </h2>
            <p className="text-lg text-ink-muted mb-8 max-w-xl mx-auto">
              Join thousands of learners sharpening their trading skills — risk-free. Stop guessing, start replaying.
            </p>
            <a href={api.auth.googleUrl}>
              <Button size="xl" className="glow-green group">
                Create Free Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Tracks />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
