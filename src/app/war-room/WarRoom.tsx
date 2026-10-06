"use client";

import WarRoomMap from "./WarRoomMap";
import { jokeVenues } from "@/data/warRoom";
import { PageShell } from "@/components/ui";

export default function WarRoom() {
  return (
    <PageShell
      title="The War Room"
      tagline="The 2027 venue hunt. Every option below is under active consideration. Tell no one."
      badge={
        <p className="inline-block rounded-md bg-amber py-1.5 pr-3.25 pl-4.5 text-xs font-black tracking-[.3em] text-forest uppercase">
          Classified
        </p>
      }
    >
      <section className="mb-4 w-full" aria-label="Venue hunt map">
        <WarRoomMap />
      </section>

      <div className="mt-8 flex w-full flex-col gap-5">
        {jokeVenues.map((v) => (
          <article
            key={v.id}
            className="rounded-2xl bg-cream px-6.5 py-5.5 text-left text-forest shadow-card"
          >
            {/* On phones the status chip sits above the name so long names keep their width. */}
            <div className="flex items-start justify-between gap-4 max-sm:flex-col-reverse max-sm:gap-2.5">
              <div>
                <h2 className="text-[1.7rem] leading-[1.1] tracking-[-.01em]">{v.name}</h2>
                <p className="mt-1 text-base font-bold opacity-60">{v.location}</p>
              </div>
              <span className="shrink-0 rounded-full bg-forest px-3.25 py-1.5 text-xs font-black tracking-[.1em] whitespace-nowrap text-amber uppercase">
                {v.status}
              </span>
            </div>
            <dl className="mt-4 grid gap-2.25">
              {[
                ["Capacity", v.capacity],
                ["Pro", v.pro],
                ["Con", v.con],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[5.2rem_1fr] items-baseline gap-2.75">
                  <dt className="text-xs font-black tracking-[.14em] uppercase opacity-55">{label}</dt>
                  <dd className="text-base">{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
