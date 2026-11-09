import Link from "next/link";
import { PageShell } from "@/components/ui";

export default function NotFoundPage() {
  return (
    <PageShell
      title="No such bar"
      tagline="That page does not exist. Maybe the bar closed, maybe the link is wrong."
    >
      <p className="mt-6">
        <Link
          href="/"
          className="inline-block min-h-11 rounded-xl bg-amber px-5 py-3 text-base font-black text-forest"
        >
          Back to the countdown
        </Link>
      </p>
    </PageShell>
  );
}
