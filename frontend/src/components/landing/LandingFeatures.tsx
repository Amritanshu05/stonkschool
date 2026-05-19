import { ReactNode } from "react";

const FEATURES: Array<{ title: string; body: string; icon: ReactNode }> = [
  {
    title: "Contests, not gambling",
    body: "Pick how to split your virtual capital across a small basket. The market decides — entry fees become a shared prize pool.",
    icon: <TrophyIcon />,
  },
  {
    title: "Replay any market hour",
    body: "Travel back to a real session and trade it minute by minute. See exactly what would have happened, before risking real money.",
    icon: <ClockIcon />,
  },
  {
    title: "Plain-English lessons",
    body: "Short reads tied to what you just did. Why did your portfolio drop 2%? You'll know in one paragraph.",
    icon: <BookIcon />,
  },
  {
    title: "Skill-first leaderboards",
    body: "Beat opponents on returns, not on betting size. The best move wins — even if your wallet is small.",
    icon: <TrendIcon />,
  },
];

export function LandingFeatures() {
  return (
    <section className="container py-16 lg:py-24">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything a beginner actually needs.
        </h2>
        <p className="mt-3 text-ink-muted">
          We took out the jargon and the leverage. What&apos;s left is a clean
          loop: try a move, see the outcome, learn the why.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="ss-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-600">
              {f.icon}
            </div>
            <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-ink-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrophyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M21 6a3 3 0 0 1-3 3" />
      <path d="M3 6a3 3 0 0 0 3 3" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h10a4 4 0 0 1 4 4v12" />
      <path d="M4 4v16h12" />
    </svg>
  );
}
function TrendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 7-9" />
      <path d="M14 6h6v6" />
    </svg>
  );
}
