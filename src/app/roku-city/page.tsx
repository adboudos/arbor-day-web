import type { Metadata } from "next";
import RokuCity from "./RokuCity";
import { PageShell } from "@/components/ui";

export const metadata: Metadata = {
  title: "Roku City, Chicago: 6th Annual Arbor Day",
  description:
    "A moving Chicago skyline, Roku City style, with Willis Tower, the Bean, the Navy Pier Ferris Wheel, the L, and the past Arbor Day venues lit up as storefronts.",
};

export default function RokuCityPage() {
  return (
    <PageShell
      title="Roku City"
      tagline="A moving Chicago skyline, Roku City style. The landmarks you know, the bars you remember, and one dark storefront waiting for 2027."
    >
      <RokuCity />
    </PageShell>
  );
}
