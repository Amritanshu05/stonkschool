import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { Footer } from "./Footer";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
