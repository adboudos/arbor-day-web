import { editions } from "@/data/history";
import VenueMap, { MapPin } from "./VenueMap";

/** Pins are derived from the editions data — the map has no hardcoded venues. */
const pins: MapPin[] = editions
  .filter((e) => e.lat !== undefined && e.lng !== undefined)
  .map((e) => ({
    year: e.year,
    venue: e.venue,
    neighborhood: e.neighborhood,
    lat: e.lat as number,
    lng: e.lng as number,
  }));

export default function HistoryPage() {
  return (
    <main className="history-page">
      <header className="history-hero">
        <p className="history-kicker">
          <a href="/">&larr; arborday.beer</a>
        </p>
        <h1>Past Arbor Days</h1>
        <p className="history-tagline">
          Every bar that&apos;s hosted the party, pinned on one map. The 2026
          flyer calls that year the 5th annual, so it all started in 2022.
        </p>
      </header>

      <section className="history-map-section" aria-label="Map of past venues">
        <VenueMap pins={pins} />
      </section>

      <div className="timeline">
        {editions.map((edition, i) => (
          <article
            key={edition.year}
            className={`timeline-item ${i % 2 ? "flip" : ""}`}
          >
            <div className="timeline-dot" aria-hidden="true" />
            <div className="card">
              <div className="year-badge">{edition.year}</div>
              <p className="when">{edition.date}</p>
              <h2 className="where">
                {edition.venue}
                {edition.neighborhood && (
                  <span className="neighborhood"> &middot; {edition.neighborhood}</span>
                )}
              </h2>
              {edition.address && <p className="address">{edition.address}</p>}
              {edition.photos.length > 0 && (
                <div className="photos">
                  {edition.photos.map((photo) => (
                    <img
                      key={photo.src}
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <footer className="history-footer">
        <a href="/">&larr; Back to the countdown</a>
      </footer>
    </main>
  );
}
