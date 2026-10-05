import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";
import Countdown from "./countdown";

const display = Fraunces({ subsets: ["latin"], weight: ["900"] });
const body = Karla({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "6th Annual Arbor Day",
  description: "Plant a tree. Raise a glass. Friday, April 30, 2027. Venue to be Announced.",
};

const leaves = ["🍃", "🍂", "🍃", "🍂", "🍃", "🍂", "🍃", "🍂"];

export default function Home() {
  return (
    <main className={`hero ${body.className}`}>
      <div className="leaves" aria-hidden="true">
        {leaves.map((l, i) => (
          <span key={i} style={{ ["--i" as string]: i }}>{l}</span>
        ))}
      </div>

      <p className="kicker">You&apos;re invited</p>

      <h1 className={display.className}>
        <span className="six">6<sup>th</sup></span>
        <span className="annual">Annual</span>
        <span className="title">Arbor Day</span>
      </h1>

      <p className="tagline">Plant a tree. Raise a glass.</p>

      <svg className="tree" viewBox="0 0 120 140" role="img" aria-label="A happy little tree">
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

      <dl className="details">
        <div><dt>When</dt><dd>Friday, April 30, 2027</dd></div>
        <div><dt>Where</dt><dd>Venue to be announced</dd></div>
      </dl>

      <footer>arborday.beer &middot; more details coming soon</footer>
    </main>
  );
}