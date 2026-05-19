const STEPS = [
  {
    n: "01",
    title: "Sign in with Google",
    body: "We create your account and credit you with virtual coins. No card, no KYC, no real-money limits.",
  },
  {
    n: "02",
    title: "Pick a contest",
    body: "Pay a small entry in virtual coins. Each contest has a tiny basket of assets and a clear time window.",
  },
  {
    n: "03",
    title: "Allocate, then watch",
    body: "Split 100% across the basket and lock in. We compute portfolio values live until the bell rings.",
  },
  {
    n: "04",
    title: "Settle and learn",
    body: "Top three split the prize pool. You get a short, plain-English breakdown of what worked and why.",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="bg-bg-subtle/60 py-16 lg:py-24">
      <div className="container">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            From sign-in to settled in minutes.
          </h2>
          <p className="mt-3 text-ink-muted">
            We kept the loop short on purpose. You learn faster from many small
            cycles than from one big bet.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="ss-card relative p-6"
            >
              <span className="num text-xs font-semibold tracking-widest text-brand-600">
                {s.n}
              </span>
              <h3 className="mt-2 text-base font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
