import type { Metadata } from "next";
import Link from "next/link";
import { PARTIFUL_URL } from "@/lib/site";
import { Fraunces, Karla } from "next/font/google";
import Countdown from "./countdown";

const display = Fraunces({ subsets: ["latin"], weight: ["900"] });
const body = Karla({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "6th Annual Arbor Day",
  description: "Plant a tree. Raise a glass. Friday, April 30, 2027. Venue to be Announced.",
};

const leaves = ["🍃", "🍂", "🍃", "🍂", "🍃", "🍂", "🍃", "🍂"];

const footerLink = "underline decoration-cream/40 underline-offset-2 hover:text-amber";

export default function Home() {
  return (
    <main
      className={`relative flex flex-1 flex-col items-center justify-center gap-4.5 overflow-hidden bg-[radial-gradient(circle_at_50%_0%,var(--color-moss)_0,var(--color-forest)_65%)] px-5 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] text-center ${body.className}`}
    >
      <div aria-hidden="true">
        {leaves.map((l, i) => (
          <span
            key={i}
            className="absolute -top-12 text-[1.6rem] opacity-80 motion-safe:animate-fall"
            style={{
              left: `${i * 13}%`,
              animationDuration: `${9 + i * 1.3}s`,
              animationDelay: `${i * -2.1}s`,
            }}
          >
            {l}
          </span>
        ))}
      </div>

      <p className="text-sm font-bold tracking-[.25em] text-leaf uppercase">You&apos;re invited</p>

      <h1 className={`flex flex-col items-center leading-[.9] tracking-[-.02em] ${display.className}`}>
        <span className="text-[clamp(7rem,32vw,13rem)] text-amber text-shadow-[0_.015em_0_var(--color-amber-dark)]">
          6<sup className="relative top-[.25em] ml-[.04em] align-top text-[.35em]">th</sup>
        </span>
        <span className="-mt-[.3em] text-[clamp(1.6rem,7vw,3rem)] tracking-[.18em] uppercase">Annual</span>
        <span className="text-[clamp(3rem,13vw,6rem)] text-cream">Arbor Day</span>
      </h1>

      <p className="text-xl font-bold">Plant a tree. Raise a glass.</p>

      <svg
        className="h-auto w-30 origin-bottom motion-safe:animate-sway"
        viewBox="0 0 120 140"
        role="img"
        aria-label="A happy little tree"
      >
        <rect x="54" y="82" width="12" height="50" rx="4" fill="#8a5a36" />
        <circle cx="60" cy="48" r="36" fill="#3f8f4a" />
        <circle cx="36" cy="66" r="24" fill="#58a85c" />
        <circle cx="84" cy="66" r="24" fill="#8fcf6a" />
        <circle cx="50" cy="44" r="4" fill="#14301f" />
        <circle cx="70" cy="44" r="4" fill="#14301f" />
        <path d="M50 58 Q60 68 70 58" stroke="#14301f" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <ellipse cx="60" cy="134" rx="30" ry="5" fill="#0d2015" opacity=".5" />
      </svg>

      <Countdown />

      <dl className="mt-1.5 grid w-full max-w-88 gap-2.75">
        {[
          ["When", "Friday, April 30, 2027"],
          ["Where", "Venue to be announced"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-cream px-4 py-3.25 text-forest">
            <dt className="text-xs font-bold tracking-[.15em] uppercase opacity-65">{label}</dt>
            <dd className="text-xl font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 mb-2">
        <a
          className="inline-block rounded-full bg-amber px-8.75 py-3.5 text-base font-black tracking-[.14em] text-forest uppercase hover:brightness-[1.08]"
          href={PARTIFUL_URL}
          target="_blank"
          rel="noopener"
        >
          RSVP on Partiful
        </a>
      </p>

      <footer className="mt-4 text-sm opacity-70">
        arborday.beer &middot; more details coming soon &middot;{" "}
        <Link href="/history" className={footerLink}>past parties</Link> &middot;{" "}
        <Link href="/hall-of-fame" className={footerLink}>out-of-towner hall of fame</Link> &middot;{" "}
        <Link href="/ideas" className={footerLink}>ideas &amp; requests</Link>
      </footer>
    </main>
  );
}
