"use client";

import { PageShell } from "@/components/ui";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageShell
      title="Something broke"
      tagline="The page tripped over its own feet. The party is still on."
    >
      <p className="mt-6 max-w-136 text-center text-base leading-relaxed">
        Give it another shot, or head back to the countdown and try again in a
        minute.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 min-h-11 cursor-pointer rounded-xl bg-amber px-5 py-3 text-base font-black text-forest"
      >
        Try again
      </button>
    </PageShell>
  );
}
