"use client";

import { EmptyNote, PageShell, Section, Stat } from "@/components/ui";
import {
  STATUS_SUMMARY,
  contenders,
  criteria,
  deadVenues,
  droppedVenues,
  formOnly,
  gimmicks,
  phoneOnly,
  principles,
  replies,
  shortlist,
  type GimmickStatus,
} from "@/data/admin";

const PARTY_DATE = new Date(2027, 3, 30);

function daysOut(): number {
  const now = new Date();
  const ms = PARTY_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86400000));
}

const gimmickBadge: Record<GimmickStatus, string> = {
  done: "bg-leaf/25 text-leaf border-leaf/50",
  proposed: "bg-amber/25 text-amber border-amber/50",
  idea: "bg-cream/10 text-cream/80 border-cream/30",
};

const card =
  "w-full rounded-2xl border border-cream/16 bg-cream/6 p-5 text-left";

export default function AdminDashboard() {
  return (
    <PageShell
      badge={
        <span className="rounded-md bg-amber px-3 py-1.5 text-xs font-black tracking-[.3em] text-forest uppercase">
          Hosts only
        </span>
      }
      title="Admin"
      tagline="The 2027 venue hunt and the gimmick pipeline. To update this page, edit src/data/admin.ts."
    >
      <div className="w-full rounded-2xl border border-amber/40 bg-amber/10 p-5 text-center">
        <p className="text-lg font-bold text-cream">{STATUS_SUMMARY}</p>
        <p className="mt-1 text-sm font-bold tracking-[.14em] text-amber uppercase">
          {daysOut()} days out
        </p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2.75">
        <Stat value={contenders.length} label="contenders" />
        <Stat value={replies.length} label="replies in" />
        <Stat
          value={phoneOnly.length + formOnly.length}
          label="awaiting outreach"
        />
        <Stat value={deadVenues.length + droppedVenues.length} label="dead or dropped" />
      </div>

      <Section
        label="Featured contenders"
        title="Contenders"
        sub="The shortlist as of the Sep 30 co-owner update."
      >
        <div className="flex w-full flex-col gap-4">
          {contenders.map((c) => (
            <article key={c.name} className={card}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-cream">{c.name}</h3>
                  <p className="text-sm font-bold opacity-60">{c.location}</p>
                </div>
                <span className="shrink-0 rounded-full border border-amber/50 bg-amber/25 px-3 py-1 text-xs font-black tracking-wider text-amber uppercase">
                  Contender
                </span>
              </div>
              <ul className="mt-3 flex flex-col gap-1.5">
                {c.deal.map((d) => (
                  <li key={d} className="text-base">
                    {d}
                  </li>
                ))}
              </ul>
              {c.caveats.length > 0 && (
                <ul className="mt-2.5 flex flex-col gap-1.5">
                  {c.caveats.map((d) => (
                    <li
                      key={d}
                      className="rounded-lg border border-ember/40 bg-ember/10 px-3 py-2 text-sm font-bold text-ember-light"
                    >
                      Watch out: {d}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </Section>

      <Section
        label="Replies log"
        title="Replies In"
        sub="What venues have actually said."
      >
        <div className="flex w-full flex-col gap-4">
          {replies.map((r) => (
            <article key={r.venue} className={card}>
              <h3 className="text-xl font-black text-cream">{r.venue}</h3>
              <ul className="mt-2.5 flex list-disc flex-col gap-1.5 pl-5">
                {r.points.map((p) => (
                  <li key={p} className="text-base">
                    {p}
                  </li>
                ))}
              </ul>
              {r.note && (
                <p className="mt-2.5 text-sm italic opacity-70">{r.note}</p>
              )}
            </article>
          ))}
        </div>
      </Section>

      <Section
        label="Full shortlist"
        title="The Shortlist"
        sub="Everywhere still in play."
      >
        <ul className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
          {shortlist.map((s) => (
            <li
              key={s.name}
              className="rounded-xl border border-cream/16 bg-cream/6 px-4 py-3"
            >
              <b className="text-cream">{s.name}</b>
              {s.detail && (
                <span className="block text-sm opacity-65">{s.detail}</span>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        label="Awaiting outreach"
        title="Awaiting Outreach"
        sub="The ball is in our court."
      >
        <h3 className="mb-2.5 w-full text-left text-lg font-black text-cream">
          Quinn must call
        </h3>
        <ul className="flex w-full flex-col gap-2">
          {phoneOnly.map((p) => (
            <li
              key={p.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-cream/16 bg-cream/6 px-4 py-3"
            >
              <b className="text-cream">{p.name}</b>
              <a
                href={`tel:${p.contact.replace(/[^0-9]/g, "")}`}
                className="shrink-0 rounded-full bg-amber px-4 py-2 text-sm font-black text-forest"
              >
                {p.contact}
              </a>
            </li>
          ))}
        </ul>
        <h3 className="mt-6 mb-2.5 w-full text-left text-lg font-black text-cream">
          Forms submitted, awaiting reply
        </h3>
        <ul className="flex w-full flex-wrap gap-2">
          {formOnly.map((f) => (
            <li
              key={f}
              className="rounded-full border border-cream/25 px-3.5 py-1.5 text-sm font-bold text-cream/85"
            >
              {f}
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Dead and dropped" title="Dead & Dropped">
        <ul className="flex w-full flex-col gap-2">
          {deadVenues.map((d) => (
            <li
              key={d.name}
              className="rounded-xl border border-cream/12 bg-cream/4 px-4 py-3 opacity-70"
            >
              <b className="text-cream">{d.name}</b>
              {d.detail && (
                <span className="block text-sm opacity-65">{d.detail}</span>
              )}
            </li>
          ))}
        </ul>
        <details className="mt-4 w-full rounded-xl border border-cream/12 bg-cream/4 px-4 py-3">
          <summary className="cursor-pointer text-sm font-bold tracking-wide text-cream/80 uppercase">
            Dropped list ({droppedVenues.length}), do not resurface
          </summary>
          <p className="mt-2.5 text-sm leading-relaxed opacity-65">
            {droppedVenues.join(" · ")}
          </p>
        </details>
      </Section>

      <Section label="Criteria" title="The Criteria">
        <ul className="flex w-full flex-col gap-2">
          {criteria.map((c) => (
            <li
              key={c}
              className="rounded-xl border border-leaf/30 bg-leaf/10 px-4 py-3 text-base font-bold text-cream"
            >
              {c}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        label="Gimmicks"
        title="Gimmicks"
        sub="What makes it a party and not just a bar night."
      >
        <div className="mb-4 flex w-full flex-wrap justify-center gap-2">
          {principles.map((p) => (
            <span
              key={p}
              className="rounded-full bg-forest px-4 py-2 text-sm font-black tracking-[.12em] text-amber uppercase ring-1 ring-amber/40"
            >
              {p}
            </span>
          ))}
        </div>
        <div className="flex w-full flex-col gap-2.5">
          {gimmicks.map((g) => (
            <article
              key={g.name}
              className="flex items-start justify-between gap-3 rounded-xl border border-cream/16 bg-cream/6 px-4 py-3"
            >
              <div>
                <b className="text-cream">{g.name}</b>
                <span className="block text-sm opacity-65">
                  {g.description}
                  {g.year ? ` (${g.year})` : ""}
                </span>
              </div>
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black tracking-wider uppercase ${gimmickBadge[g.status]}`}
              >
                {g.status}
              </span>
            </article>
          ))}
        </div>
        <EmptyNote className="mt-4">
          Sticker designs needed. Somebody has to draw these.
        </EmptyNote>
      </Section>
    </PageShell>
  );
}
