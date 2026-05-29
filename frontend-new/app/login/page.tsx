import type { Metadata } from "next";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { TrendingUp, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to StonkSchool using your Google account to start learning and competing.",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden">
      {/* Background grid + glow */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in srgb, var(--green) 8%, transparent) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Card */}
        <div className="rounded-2xl border border-line bg-bg-surface/90 backdrop-blur-xl p-8 shadow-xl">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green/10 border border-green/20">
              <TrendingUp className="h-6 w-6 text-green" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold">
                Stonk<span className="text-green">School</span>
              </h1>
              <p className="mt-1 text-sm text-ink-muted">
                Trade without risk. Learn without limits.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-6 border-t border-line" />

          {/* Sign in */}
          <div className="flex flex-col gap-4">
            <p className="text-center text-sm font-medium text-ink">
              Sign in to continue
            </p>

            <a href={api.auth.googleUrl} className="w-full">
              <Button variant="outline" size="lg" className="w-full gap-3">
                <Globe className="h-5 w-5" />
                Continue with Google
              </Button>
            </a>

            <p className="text-center text-xs text-ink-faint leading-relaxed">
              By signing in, you agree that StonkSchool uses{" "}
              <strong>virtual coins only</strong>. No real money is involved.
            </p>
          </div>

          {/* Footer note */}
          <div className="mt-6 border-t border-line pt-4 text-center">
            <p className="text-xs text-ink-faint">
              New here? Your account and wallet are created automatically.
            </p>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="mt-6 text-center text-xs text-ink-faint">
          ₹1,00,000 virtual capital · Real market data · Zero risk
        </p>
      </div>
    </div>
  );
}
