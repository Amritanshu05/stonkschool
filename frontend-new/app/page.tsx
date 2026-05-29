import type { Metadata } from "next";
import LandingPage from "./landing";

export const metadata: Metadata = {
  title: "StonkSchool — Learn Trading Without Risk",
  description:
    "Master financial markets with zero risk. Replay historical data, compete in skill-based contests, and learn investing using virtual capital.",
};

export default function Page() {
  return <LandingPage />;
}
