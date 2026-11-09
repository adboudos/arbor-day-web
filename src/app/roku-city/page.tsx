import type { Metadata } from "next";
import RokuCity from "./RokuCity";

export const metadata: Metadata = {
  title: "Roku City, Chicago: 6th Annual Arbor Day",
  description:
    "A moving Chicago skyline, Roku City style, with Willis Tower, the Bean, the Navy Pier Ferris Wheel, the L, and the past Arbor Day venues lit up as storefronts.",
};

export default function RokuCityPage() {
  return <RokuCity />;
}
