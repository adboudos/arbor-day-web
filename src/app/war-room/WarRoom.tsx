"use client";

import Link from "next/link";
import WarRoomMap from "./WarRoomMap";
import { jokeVenues } from "@/data/warRoom";

export default function WarRoom() {
  return (
    <main className="history-page">
      <header className="history-hero">
        <p className="history-kicker">
          <Link href="/">&larr; arborday.beer</Link>
        </p>
        <p className="war-classified">Classified</p>
        <h1>The War Room</h1>
        <p className="history-tagline">
          The 2027 venue hunt. Every option below is under active
          consideration. Tell no one.
        </p>
      </header>

      <section className="history-map-section" aria-label="Venue hunt map">
        <WarRoomMap />
      </section>

      <div className="war-list">
        {jokeVenues.map((v) => (
          <article key={v.id} className="war-card">
            <div className="war-card-head">
              <div>
                <h2>{v.name}</h2>
                <p className="war-location">{v.location}</p>
              </div>
              <span className="war-status">{v.status}</span>
            </div>
            <dl className="war-details">
              <div>
                <dt>Capacity</dt>
                <dd>{v.capacity}</dd>
              </div>
              <div>
                <dt>Pro</dt>
                <dd>{v.pro}</dd>
              </div>
              <div>
                <dt>Con</dt>
                <dd>{v.con}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <footer className="history-footer">
        <Link href="/">&larr; Back to the countdown</Link>
      </footer>
    </main>
  );
}
