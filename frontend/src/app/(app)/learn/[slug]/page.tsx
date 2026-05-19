import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";

type LessonContent = {
  slug: string;
  track: string;
  minutes: number;
  title: string;
  body: { heading?: string; paragraph: string }[];
};

const CONTENT: Record<string, LessonContent> = {
  "what-is-an-asset": {
    slug: "what-is-an-asset",
    track: "Basics",
    minutes: 4,
    title: "What is an asset, really?",
    body: [
      {
        paragraph:
          "An asset is anything that gives you a claim on future value. A share in a company gives you a slice of its future profits. A bond gives you a stream of future interest payments. A crypto token gives you whatever its protocol decides — sometimes useful, sometimes nothing.",
      },
      {
        heading: "Three honest questions",
        paragraph:
          "Before you ever buy something, answer these in plain words: What does this asset produce? Who has to pay me, and why would they keep paying? What event would make it worthless? If you cannot answer all three, you are speculating — which is fine, as long as you call it that.",
      },
      {
        heading: "Why this matters on StonkSchool",
        paragraph:
          "Every contest puts a small basket in front of you. The winning move usually isn't picking the loudest asset — it's picking the one whose answer to those three questions held up best during the contest window.",
      },
    ],
  },
  "what-moves-prices": {
    slug: "what-moves-prices",
    track: "Markets",
    minutes: 5,
    title: "Why prices move (and why most reasons are wrong)",
    body: [
      {
        paragraph:
          "Prices move when more money wants to buy than to sell, or vice versa. That's it. News, earnings, tweets — they only matter to the extent they change someone's willingness to act.",
      },
      {
        paragraph:
          "On StonkSchool the deterministic seed market gives you a controlled playground. Use it to feel the difference between noise (small intra-minute jiggles) and signal (a steady drift across many minutes).",
      },
    ],
  },
  "diversification-is-not-magic": {
    slug: "diversification-is-not-magic",
    track: "Strategy",
    minutes: 6,
    title: "Diversification is not magic",
    body: [
      {
        paragraph:
          "Owning ten things that all move together is not diversification, it's a louder bet on one direction. Real diversification needs assets whose prices respond to different forces.",
      },
      {
        paragraph:
          "When you allocate in a contest, ask: if my biggest position drops 5%, does my smallest position usually drop too? If yes, you don't have a hedge — you have a heavier bet.",
      },
    ],
  },
  "fee-drag": {
    slug: "fee-drag",
    track: "Basics",
    minutes: 3,
    title: "The quiet cost of every trade",
    body: [
      {
        paragraph:
          "Every trade you make costs something — exchange fees, spread, and slippage when liquidity is thin. Even a 0.2% drag, applied to 30 trades a month, is 6% a year that the market never gets a chance to give you back.",
      },
      {
        paragraph:
          "StonkSchool's contests deliberately lock you into a small number of moves. That's not a limitation — that's the lesson.",
      },
    ],
  },
  "loss-aversion": {
    slug: "loss-aversion",
    track: "Psychology",
    minutes: 5,
    title: "Why losses hurt twice as much",
    body: [
      {
        paragraph:
          "Losing 1,000 VC feels worse than gaining 1,000 VC feels good. Researchers have measured the gap — it's roughly 2×. Knowing this in advance is half the cure.",
      },
      {
        paragraph:
          "Practice the boring move: when you feel the urge to 'make it back,' close the app. Come back when the next contest opens. The market will still be here.",
      },
    ],
  },
  "reading-a-candle": {
    slug: "reading-a-candle",
    track: "Markets",
    minutes: 4,
    title: "Reading a candle without lying to yourself",
    body: [
      {
        paragraph:
          "A candle has four numbers: open, high, low, close. The body is open→close, the wicks are the rest. A long upper wick means buyers tried to push, but sellers pushed back — interesting context, not a forecast.",
      },
      {
        paragraph:
          "On the replay screen, watch how candles cluster after a strong move. The cluster, not any single candle, is the signal worth respecting.",
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(CONTENT).map((slug) => ({ slug }));
}

export default function LessonPage({ params }: { params: { slug: string } }) {
  const lesson = CONTENT[params.slug];
  if (!lesson) notFound();

  return (
    <div className="container max-w-3xl py-10">
      <Link
        href="/learn"
        className="text-sm font-medium text-ink-muted hover:text-ink"
      >
        ← Back to Learn
      </Link>

      <div className="mt-6 flex items-center gap-2">
        <Badge tone="brand">{lesson.track}</Badge>
        <span className="text-xs text-ink-muted">{lesson.minutes} min read</span>
      </div>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {lesson.title}
      </h1>

      <div className="ss-card mt-8 p-8 prose prose-stonk">
        {lesson.body.map((block, i) => (
          <div key={i} className="mb-6 last:mb-0">
            {block.heading ? (
              <h3 className="mb-2 text-base font-semibold text-ink">
                {block.heading}
              </h3>
            ) : null}
            <p className="text-[15px] leading-7 text-ink-muted">
              {block.paragraph}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Link
          href="/learn"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          ← All lessons
        </Link>
        <Link
          href="/contests"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Try it in a contest →
        </Link>
      </div>
    </div>
  );
}
