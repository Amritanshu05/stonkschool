import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "StonkSchool — Learn Trading Without Risk",
    template: "%s | StonkSchool",
  },
  description:
    "StonkSchool is an educational fantasy trading platform. Replay historical markets, compete in skill-based contests, and learn investing without risking real capital.",
  keywords: [
    "trading simulator",
    "fantasy trading",
    "stock market education",
    "paper trading",
    "crypto simulation",
    "investment learning",
  ],
  authors: [{ name: "StonkSchool" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://stonkschool.com",
    siteName: "StonkSchool",
    title: "StonkSchool — Learn Trading Without Risk",
    description:
      "Replay markets, compete in contests, and master investing — all with virtual capital.",
  },
  twitter: {
    card: "summary_large_image",
    title: "StonkSchool",
    description: "Learn trading without risk. Compete. Win.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
