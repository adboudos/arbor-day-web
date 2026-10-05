import type { Metadata } from "next";
import IdeasBoard from "./IdeasBoard";

export const metadata: Metadata = {
  title: "Ideas & Requests: 6th Annual Arbor Day",
  description:
    "The open suggestion box for Arbor Day: post feedback, ideas, and requests, then vote the best to the top.",
};

export default function IdeasPage() {
  return <IdeasBoard />;
}
