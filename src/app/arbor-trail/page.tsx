import type { Metadata } from "next";
import ArborTrailGame from "./ArborTrailGame";

export const metadata: Metadata = {
  title: "The Arbor Day Trail: 6th Annual Arbor Day",
  description:
    "50 beers. One night. Lead your crew down the Arbor Day Trail, survive the landmarks of parties past, and reach midnight with your dignity.",
};

export default function ArborTrailPage() {
  return <ArborTrailGame />;
}
