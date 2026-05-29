"use client";

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
import { motion } from "motion/react";

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 sm:pt-32 sm:pb-40">
      {/* Background Fiery Vortex Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        {/* Core Black Hole (Dark Center) */}
        <div className="absolute h-[500px] w-[500px] rounded-full bg-bg z-10 blur-[60px]" />
        
        {/* Swirling Accretion Disk */}
        <div className="absolute w-[1200px] h-[1200px] animate-spin-slow flex items-center justify-center opacity-80" style={{ animationDuration: '40s' }}>
           {/* Huge orange ring */}
           <div className="absolute w-[1000px] h-[1000px] rounded-full border-[80px] border-[#ea580c]/30 blur-[80px]" />
           {/* Bright red inner arc */}
           <div className="absolute w-[800px] h-[800px] rounded-full border-[60px] border-transparent border-t-[#dc2626]/40 blur-[60px] rotate-45" />
           {/* Intense bright yellow/amber streak */}
           <div className="absolute w-[900px] h-[900px] rounded-[100%] border-[40px] border-transparent border-r-[#f59e0b]/50 blur-[50px] -rotate-12" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 text-center">
        {/* Floating Badges */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block mx-auto max-w-7xl z-20">
           <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="absolute left-[5%] top-[20%] px-4 py-2 rounded-full flex items-center gap-2 border border-white/10 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] bg-white/5 backdrop-blur-md text-ink">
              <Globe className="h-4 w-4 text-green" /> <span className="text-sm font-semibold">Crypto</span>
           </motion.div>
           <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="absolute right-[8%] top-[15%] px-4 py-2 rounded-full flex items-center gap-2 border border-white/10 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] bg-white/5 backdrop-blur-md text-ink">
              <PieChart className="h-4 w-4 text-amber" /> <span className="text-sm font-semibold">ETFs</span>
           </motion.div>
           <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="absolute left-[12%] top-[45%] px-4 py-2 rounded-full flex items-center gap-2 border border-white/10 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] bg-white/5 backdrop-blur-md text-ink">
              <LineChart className="h-4 w-4 text-blue" /> <span className="text-sm font-semibold">Equities</span>
           </motion.div>
           <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="absolute right-[5%] top-[40%] px-4 py-2 rounded-full flex items-center gap-2 border border-white/10 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] bg-white/5 backdrop-blur-md text-ink">
              <Activity className="h-4 w-4 text-red" /> <span className="text-sm font-semibold">Live Data</span>
           </motion.div>
        </div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1] text-ink"
        >
          Trade Markets Like a Pro Without Losing a <span className="gradient-text">Rupee</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-ink-muted leading-relaxed"
        >
          StonkSchool gives you a risk-free arena to replay historical markets,
          sharpen strategies, and compete in skill-based contests.
        </motion.p>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="mt-8 flex justify-center"
        >
          <a href={api.auth.googleUrl}>
            <Button size="xl" className="glow-green group rounded-full px-8">
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 ml-2" />
            </Button>
          </a>
        </motion.div>

        {/* 3-Card Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="mx-auto mt-10 lg:mt-20 w-full flex justify-center h-[180px] min-[400px]:h-[220px] sm:h-[280px] md:h-[380px] lg:h-auto overflow-visible pointer-events-none"
        >
          <div className="flex items-center justify-center gap-6 min-w-max origin-top scale-[0.32] min-[400px]:scale-[0.4] sm:scale-[0.55] md:scale-[0.75] lg:scale-100 pointer-events-auto">
          {/* Card 1: Markets */}
          <div className="w-[320px] flex-shrink-0 glass rounded-2xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-white/10 bg-gradient-to-br from-white/5 via-bg-surface/90 to-bg-surface/90 backdrop-blur-xl text-left transform lg:translate-y-8 relative overflow-hidden">
             {/* Soft inner glow */}
             <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" />
             <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-ink">Markets</span>
                <span className="text-xs text-green cursor-pointer">See All</span>
             </div>
             <div className="space-y-4">
                {[
                  { sym: "BTC", price: "$58,240", pnl: "+2.4%", color: "bg-amber-500" },
                  { sym: "ETH", price: "$3,105", pnl: "+1.2%", color: "bg-blue-500" },
                  { sym: "SOL", price: "$145.20", pnl: "-0.5%", color: "bg-purple-500" },
                ].map((asset, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full ${asset.color}/20 flex items-center justify-center`}>
                           <div className={`h-3 w-3 rounded-full ${asset.color}`} />
                        </div>
                        <div>
                           <div className="text-sm font-bold">{asset.sym}</div>
                           <div className={`text-xs ${asset.pnl.startsWith('+') ? 'text-green' : 'text-red'}`}>{asset.pnl}</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-mono">{asset.price}</div>
                        <svg className="w-12 h-6 opacity-50 text-green inline-block ml-2" preserveAspectRatio="none" viewBox="0 0 100 100">
                          <path d="M0,50 L20,40 L40,60 L60,30 L80,45 L100,20" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Card 2: Main Chart (Center) */}
          <div className="w-[350px] flex-shrink-0 glass rounded-3xl p-6 shadow-[0_0_60px_rgba(0,166,81,0.1)] border border-white/10 bg-gradient-to-br from-white/10 via-bg-surface/90 to-bg-surface/90 backdrop-blur-2xl text-left relative z-10 scale-105 overflow-hidden">
             {/* Soft inner glow */}
             <div className="absolute -top-32 -left-32 w-64 h-64 bg-green-500/10 rounded-full blur-[50px] pointer-events-none" />
             <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                   <span className="text-xs font-semibold px-3 py-1 bg-bg-subtle rounded-full cursor-pointer text-ink">Portfolio</span>
                   <span className="text-xs font-semibold px-3 py-1 text-ink-muted hover:text-ink cursor-pointer">Contests</span>
                </div>
                <div className="flex gap-2">
                   <Activity className="h-4 w-4 text-ink-muted" />
                   <Globe className="h-4 w-4 text-ink-muted" />
                </div>
             </div>
             <div>
                <div className="text-3xl font-mono font-bold text-ink">₹1,05,420.50</div>
                <div className="text-xs text-green mt-1">+5.42% All Time</div>
             </div>
             <div className="mt-8 relative h-40 w-full">
                <svg className="w-full h-full text-green drop-shadow-[0_0_8px_rgba(0,166,81,0.5)]" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <path d="M0,100 L0,80 L20,70 L30,85 L50,40 L70,60 L90,20 L100,30 L100,100 Z" fill="currentColor" opacity="0.1" />
                   <path d="M0,80 L20,70 L30,85 L50,40 L70,60 L90,20 L100,30" fill="none" stroke="currentColor" strokeWidth="4" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {/* Point indicator as absolute HTML div to prevent stretching */}
                <div className="absolute top-[30%] right-0 w-4 h-4 bg-bg-surface border-[3px] border-green rounded-full shadow-[0_0_12px_rgba(0,166,81,1)] translate-x-1/2 -translate-y-1/2" />
             </div>
          </div>

          {/* Card 3: Exchange / Action */}
          <div className="w-[320px] flex-shrink-0 glass rounded-2xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-white/10 bg-gradient-to-br from-white/5 via-bg-surface/90 to-bg-surface/90 backdrop-blur-xl text-left transform lg:translate-y-8 relative overflow-hidden">
             {/* Soft inner glow */}
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />
             <div className="flex justify-between items-center mb-6">
                <span className="font-semibold text-ink">Quick Trade</span>
                <Lock className="h-4 w-4 text-ink-muted" />
             </div>
             
             <div className="space-y-2 relative">
                <div className="bg-bg-subtle/50 border border-line rounded-xl p-3 flex justify-between items-center">
                   <div>
                      <div className="text-xs text-ink-muted mb-1">Buy</div>
                      <div className="font-mono">BTC</div>
                   </div>
                   <div className="text-right">
                      <div className="text-lg font-mono">0.05</div>
                      <div className="text-xs text-ink-muted">~ ₹2,42,600</div>
                   </div>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-bg-surface border border-line rounded-full flex items-center justify-center z-10 shadow-sm cursor-pointer hover:bg-bg-subtle transition-colors">
                   <ArrowRight className="h-3 w-3 rotate-90 text-ink-muted" />
                </div>

                <div className="bg-bg-subtle/50 border border-line rounded-xl p-3 flex justify-between items-center">
                   <div>
                      <div className="text-xs text-ink-muted mb-1">Pay with</div>
                      <div className="font-mono flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-green flex items-center justify-center"><span className="text-[8px] text-bg font-bold">V</span></div> VCOIN</div>
                   </div>
                   <div className="text-right">
                      <div className="text-lg font-mono text-ink-muted">2,42,600</div>
                      <div className="text-xs text-ink-muted">Balance: ₹1M</div>
                   </div>
                </div>
             </div>
             
             <Button className="w-full mt-4 glow-green bg-green/20 text-green hover:bg-green/30" variant="secondary">Preview Order</Button>
          </div>
          </div>
        </motion.div>

        {/* Organizations Strip */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-24 pt-8 border-t border-line/50"
        >
          <p className="text-sm font-medium text-ink-muted mb-6">Simplifying Trading Education For 2,500+ Students</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale filter">
             {/* Abstract Logos */}
             <div className="flex items-center gap-2 font-bold text-xl"><Globe className="h-6 w-6"/> AlphaFund</div>
             <div className="flex items-center gap-2 font-bold text-xl"><PieChart className="h-6 w-6"/> QuantEdge</div>
             <div className="flex items-center gap-2 font-bold text-xl"><TrendingUp className="h-6 w-6"/> BullRun Academy</div>
             <div className="flex items-center gap-2 font-bold text-xl"><Shield className="h-6 w-6"/> SecureTrade</div>
          </div>
        </motion.div>

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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <Badge variant="outline" size="md" className="mb-4">Platform Features</Badge>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything you need to{" "}
            <span className="gradient-text">master markets</span>
          </h2>
          <p className="mt-4 text-ink-muted max-w-xl mx-auto">
            A full-stack trading education platform with live data, real-time competition, and zero financial risk.
          </p>
        </motion.div>

        {/* Bento Grid layout */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(180px,auto)]">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className={f.colSpan}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card
                className={`group overflow-hidden hover:border-line/80 hover:-translate-y-1 transition-all duration-300 relative h-full`}
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
            </motion.div>
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" size="md" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl font-bold sm:text-4xl">
            From zero to competing in{" "}
            <span className="gradient-text">4 steps</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-8 left-0 right-0 hidden lg:block">
            <div className="mx-auto max-w-4xl h-px bg-gradient-to-r from-transparent via-line to-transparent" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div 
                key={step.step} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center gap-5 group"
              >
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
              </motion.div>
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <Badge variant="outline" size="md" className="mb-4">Contest Tracks</Badge>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Three arenas.{" "}
            <span className="gradient-text">One skill to prove.</span>
          </h2>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-3">
          {TRACKS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/contests?track=${t.id}`}>
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
            </motion.div>
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
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative rounded-3xl border border-green/20 bg-bg-surface p-12 overflow-hidden shadow-[0_0_40px_rgba(0,166,81,0.05)]"
        >
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
        </motion.div>
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
