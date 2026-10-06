import VenueMap, { MapPin } from "./VenueMap";
import { fetchEditions } from "@/lib/supabase";
import { PageShell } from "@/components/ui";

/** Revalidate the timeline from Supabase hourly. */
export const revalidate = 3600;

export default async function HistoryPage() {
  const editions = await fetchEditions();

  /** Pins are derived from the editions data, so the map has no hardcoded venues. */
  const pins: MapPin[] = editions
    .filter((e) => e.lat !== undefined && e.lng !== undefined)
    .map((e) => ({
      year: e.year,
      venue: e.venue,
      neighborhood: e.neighborhood,
      lat: e.lat as number,
      lng: e.lng as number,
    }));

  return (
    <PageShell
      title="Past Arbor Days"
      tagline={
        <>
          Every bar that&apos;s hosted the party, pinned on one map. The 2026
          flyer calls that year the 5th annual, so it all started in 2022.
        </>
      }
    >
      <section className="mb-4 w-full" aria-label="Map of past venues">
        <VenueMap pins={pins} />
      </section>

      {/* Vertical line runs down the left on mobile and through the middle on wider screens. */}
      <ol className="relative mt-10 mb-4 flex w-full flex-col gap-11 before:absolute before:top-2 before:bottom-2 before:left-[calc(1.1rem-1.5px)] before:w-[3px] before:rounded-xs before:bg-linear-to-b before:from-leaf before:to-leaf/8 min-[46rem]:before:left-1/2 min-[46rem]:before:-translate-x-1/2">
        {editions.map((edition, i) => {
          const flip = i % 2 === 1;
          return (
            <li
              key={edition.year}
              className="relative grid w-full grid-cols-[2.2rem_1fr] items-start min-[46rem]:grid-cols-[1fr_4rem_1fr]"
            >
              <div
                className="relative z-1 col-start-1 row-start-1 mt-7.5 size-4.5 justify-self-center rounded-full bg-amber ring-[.35rem] ring-amber/25 min-[46rem]:col-start-2 min-[46rem]:mt-6.5"
                aria-hidden="true"
              />
              <article
                className={`col-start-2 row-start-1 ml-4 rounded-2xl bg-cream px-6 py-5 text-left text-forest shadow-card ${
                  flip ? "min-[46rem]:col-start-3 min-[46rem]:ml-5" : "min-[46rem]:col-start-1 min-[46rem]:mr-5 min-[46rem]:ml-0"
                }`}
              >
                <div className="text-[2.2rem] leading-none font-black tracking-[-.02em]">{edition.year}</div>
                <p className="mt-1.25 text-xs font-bold tracking-[.12em] uppercase opacity-60">{edition.date}</p>
                <h2 className="mt-1.5 text-[1.6rem] leading-[1.15]">
                  {edition.venue}
                  {edition.neighborhood && (
                    <span className="text-base font-bold opacity-55"> &middot; {edition.neighborhood}</span>
                  )}
                </h2>
                {edition.address && <p className="mt-1 text-sm opacity-65">{edition.address}</p>}
                {edition.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2.5">
                    {edition.photos.map((photo) => (
                      // Plain <img> on purpose: next/image optimization would bill per image on Vercel.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={photo.src}
                        src={photo.src}
                        alt={photo.alt}
                        loading="lazy"
                        className="block h-40 w-full rounded-lg bg-forest-deep object-cover only:h-56"
                      />
                    ))}
                  </div>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </PageShell>
  );
}
