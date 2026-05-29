import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PlayCircle, BookOpen, Clock } from "lucide-react";

// Static content for MVP (would be CMS/database in production)
const ARTICLES: Record<
  string,
  {
    title: string;
    level: string;
    readTime: string;
    badge: "green" | "amber" | "blue" | "red";
    intro: string;
    sections: { heading: string; body: string }[];
  }
> = {
  "markets-101": {
    title: "Markets 101: How Financial Markets Work",
    level: "Beginner",
    readTime: "8 min read",
    badge: "green",
    intro:
      "Financial markets are systems where buyers and sellers exchange assets. Understanding their mechanics is the foundation of every trading strategy.",
    sections: [
      {
        heading: "What is a financial market?",
        body: "A financial market is any marketplace where securities — stocks, bonds, currencies, derivatives — are traded. They allow businesses to raise capital and investors to participate in economic growth.",
      },
      {
        heading: "Order books and price discovery",
        body: "Prices are set by the interaction of buy and sell orders in an order book. When a buyer's price matches a seller's price, a trade executes. This constant negotiation is called price discovery.",
      },
      {
        heading: "Market participants",
        body: "Markets have diverse participants: retail investors, institutional funds, market makers, arbitrageurs, and high-frequency traders. Each plays a role in liquidity and price efficiency.",
      },
      {
        heading: "Types of orders",
        body: "Market orders execute immediately at the best available price. Limit orders sit in the order book until their price is met. Stop orders trigger when a price threshold is hit — useful for managing risk.",
      },
    ],
  },
  crypto: {
    title: "Crypto Fundamentals: Understanding Digital Assets",
    level: "Beginner",
    readTime: "12 min read",
    badge: "amber",
    intro:
      "Cryptocurrency markets operate 24/7 globally, with unique volatility characteristics and market drivers that differ significantly from traditional assets.",
    sections: [
      {
        heading: "What makes crypto different?",
        body: "Crypto assets are decentralized — no central bank controls them. Their prices are driven by network adoption, technology upgrades, regulatory news, and speculative sentiment.",
      },
      {
        heading: "Bitcoin vs Altcoins",
        body: "Bitcoin is the original store-of-value cryptocurrency. Altcoins (alternatives) like Ethereum add programmability via smart contracts. Different tokens serve different utility purposes.",
      },
      {
        heading: "Why crypto is volatile",
        body: "Low market cap relative to traditional assets, 24/7 trading, leverage, and sentiment-driven speculation create extreme volatility — both opportunities and risks for traders.",
      },
    ],
  },
};

// Fallback for categories not in our static map
const DEFAULT_ARTICLE = {
  title: "Coming Soon",
  level: "All Levels",
  readTime: "5 min read",
  badge: "outline" as const,
  intro: "This learning module is being prepared. Check back soon!",
  sections: [],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES[slug] ?? DEFAULT_ARTICLE;
  return {
    title: article.title,
    description: article.intro,
  };
}

export default async function LearnArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = ARTICLES[slug] ?? DEFAULT_ARTICLE;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      {/* Back */}
      <Link href="/learn">
        <Button variant="ghost" size="sm" className="gap-1.5 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Learning Hub
        </Button>
      </Link>

      {/* Article header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant={article.badge as "green" | "amber" | "blue" | "red" | "outline"} size="md">
            {article.level}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-ink-faint">
            <Clock className="h-3 w-3" />
            {article.readTime}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-ink leading-snug sm:text-3xl">
          {article.title}
        </h1>
        <p className="mt-3 text-ink-muted leading-relaxed">{article.intro}</p>
      </div>

      {/* Divider */}
      <div className="mb-8 h-px bg-gradient-to-r from-transparent via-line to-transparent" />

      {/* Content */}
      {article.sections.length > 0 ? (
        <div className="prose-custom space-y-8">
          {article.sections.map((sec, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
                <span className="num text-green text-sm font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {sec.heading}
              </h2>
              <p className="text-ink-muted leading-relaxed text-[15px]">{sec.body}</p>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-10 w-10 text-ink-faint mb-3" />
          <p className="text-ink-muted">Content coming soon.</p>
        </div>
      )}

      {/* Practice CTA */}
      <div className="mt-12 rounded-xl border border-green/20 bg-green/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-ink">Apply this knowledge</p>
          <p className="text-sm text-ink-muted mt-0.5">
            Jump into Market Replay and test these concepts with real historical data.
          </p>
        </div>
        <Link href="/replay">
          <Button size="md" className="shrink-0">
            <PlayCircle className="h-4 w-4" />
            Practice Now
          </Button>
        </Link>
      </div>
    </div>
  );
}
