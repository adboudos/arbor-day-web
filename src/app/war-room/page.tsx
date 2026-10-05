import type { Metadata } from "next";
import WarRoom from "./WarRoom";

export const metadata: Metadata = {
  title: "The War Room: 2027 Venue Hunt",
  description: "Classified venue scouting for the 6th Annual Arbor Day.",
  robots: { index: false, follow: false },
};

export default function WarRoomPage() {
  return <WarRoom />;
}
