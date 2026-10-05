import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Karla } from "next/font/google";
import { editions } from "@/data/history";

const display = Fraunces({ subsets: ["latin"], weight: ["900"] });
const body = Karla({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Past Arbor Days",
  description: "Where the Arbor Day party has been, year by year.",
};

export default function History() {
  return (
    <main className={`history ${body.className}`}>
      <p className="kicker">The story so far</p>
      <h1 className={display.className}>Past Arbor Days</h1>
      <p className="tagline">One Friday every April. Plant a tree. Raise a glass.</p>

      <ol className="timeline">
        {editions.map((edition) => (
          <li
            key={edition.year}
            className={`stop${edition.upcoming ? " upcoming" : ""}`}
          >
            <div className="node" aria-hidden="true">
              <span className={display.className}>{edition.year}</span>
            </div>
            <article className="card">
              <p className={`venue ${display.className}`}>{edition.venue}</p>
              <p className="where">
                {edition.neighborhood} &middot; {edition.date}
              </p>
              <p className="deal">{edition.deal}</p>
              {edition.stats.length > 0 && (
                <dl className="stats">
                  {edition.stats.map((stat) => (
                    <div key={stat.label}>
                      <dt>{stat.label}</dt>
                      <dd>{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {edition.highlights.length > 0 && (
                <ul className="highlights">
                  {edition.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              )}
              {edition.upcoming && (
                <p className="tocontinue">
                  <Link href="/">Back to the countdown</Link>
                </p>
              )}
            </article>
          </li>
        ))}
      </ol>

      <footer className="history-footer">
        <Link href="/">&larr; Back to the party</Link>
      </footer>
    </main>
  );
}
