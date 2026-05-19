import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { API_URL } from "@/lib/api";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-16 items-center">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="ss-card p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-600">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l6-6 4 4 7-9" />
                <path d="M14 6h6v6" />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              Welcome to StonkSchool
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Sign in to claim your virtual wallet, join contests, and replay
              real market hours.
            </p>

            <a
              href={`${API_URL}/api/v1/auth/google`}
              className="mt-6 inline-flex w-full"
            >
              <Button size="lg" fullWidth>
                <GoogleMark />
                Continue with Google
              </Button>
            </a>

            <p className="mt-5 text-xs text-ink-soft">
              By continuing you agree that StonkSchool is for education only.
              Virtual coins have no monetary value.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-ink-muted">
            New here?{" "}
            <Link href="/" className="text-brand-600 hover:underline">
              See how it works
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#fff"
        d="M17.6 9.2c0-.6-.1-1.2-.2-1.7H9v3.3h4.8c-.2 1.1-.8 2-1.8 2.6v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.4z"
      />
      <path
        fill="#fff"
        d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.4C2.4 16 5.4 18 9 18z"
      />
      <path
        fill="#fff"
        d="M3.9 10.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V4.9H.9C.3 6.1 0 7.5 0 9s.3 2.9.9 4.1l3-2.4z"
      />
      <path
        fill="#fff"
        d="M9 3.6c1.3 0 2.5.5 3.4 1.4l2.6-2.6C13.5.9 11.4 0 9 0 5.4 0 2.4 2 .9 4.9l3 2.4C4.6 5.2 6.6 3.6 9 3.6z"
      />
    </svg>
  );
}
