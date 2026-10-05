import type { Metadata } from "next";
import HallOfFame from "./HallOfFame";

export const metadata: Metadata = {
  title: "Out-of-Towner Hall of Fame — 6th Annual Arbor Day",
  description:
    "The legends who traveled from beyond Illinois to celebrate Arbor Day with us. Add yourself to the wall.",
};

export default function HallOfFamePage() {
  return <HallOfFame />;
}
