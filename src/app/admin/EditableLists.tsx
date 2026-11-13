"use client";

import { useEffect, useState } from "react";
import { Button, EmptyNote, Field, Section, inputClass } from "@/components/ui";
import {
  clearList,
  loadList,
  newId,
  saveList,
  type EditableContender,
  type EditableNameItem,
} from "@/lib/adminLists";

export interface EditableList<T extends { id: string }> {
  items: T[];
  add: (item: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  move: (id: string, dir: -1 | 1) => void;
  reset: () => void;
}

/**
 * One editable list, seeded from the static data and persisted to
 * localStorage after mount (reading storage during render would break
 * hydration, since the server has no stored edits).
 */
export function useEditableList<T extends { id: string }>(
  listId: string,
  seed: T[],
): EditableList<T> {
  const [items, setItems] = useState<T[]>(seed);
  const [loaded, setLoaded] = useState(false);

  // Seed renders first so the server HTML matches, then stored edits load
  // after mount. That is the whole point of the effect, so the lint rule
  // below does not apply here.
  useEffect(() => {
    const stored = loadList<T>(listId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setItems(stored);
    setLoaded(true);
  }, [listId]);

  useEffect(() => {
    if (!loaded) return;
    saveList(listId, items);
  }, [items, loaded, listId]);

  const add = (item: T) => setItems((prev) => [...prev, item]);

  const update = (id: string, patch: Partial<T>) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );

  const remove = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const move = (id: string, dir: -1 | 1) =>
    setItems((prev) => {
      const i = prev.findIndex((it) => it.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const reset = () => {
    clearList(listId);
    setItems(seed);
  };

  return { items, add, update, remove, move, reset };
}

const iconButton =
  "flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-cream/40 bg-transparent px-3 py-2 text-base font-black text-cream disabled:opacity-30";

function MoveButtons({
  index,
  count,
  onMove,
}: {
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <span className="flex gap-2">
      <button
        type="button"
        className={iconButton}
        aria-label="Move up"
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        ↑
      </button>
      <button
        type="button"
        className={iconButton}
        aria-label="Move down"
        disabled={index === count - 1}
        onClick={() => onMove(1)}
      >
        ↓
      </button>
    </span>
  );
}

function DeleteButton({ name, onDelete }: { name: string; onDelete: () => void }) {
  return (
    <button
      type="button"
      className="min-h-11 cursor-pointer rounded-xl border border-ember/50 bg-ember/10 px-4 py-2 text-sm font-black text-ember-light"
      onClick={() => {
        if (window.confirm(`Delete ${name}?`)) onDelete();
      }}
    >
      Delete
    </button>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-amber/50 bg-amber/25 px-2 text-sm font-black text-amber">
      #{rank}
    </span>
  );
}

/* ---------------- name + detail lists ---------------- */

function NameItemForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: { name: string; detail?: string };
  submitLabel: string;
  onSubmit: (values: { name: string; detail?: string }) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [detail, setDetail] = useState(initial?.detail ?? "");
  const valid = name.trim().length > 0;

  return (
    <form
      className="flex w-full flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({ name: name.trim(), detail: detail.trim() || undefined });
        if (!initial) {
          setName("");
          setDetail("");
        }
      }}
    >
      <Field label="Bar name">
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bar name"
          aria-label="Bar name"
        />
      </Field>
      <Field label="Detail">
        <input
          className={inputClass}
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="Address, deal, or note"
          aria-label="Detail"
        />
      </Field>
      <span className="flex flex-wrap gap-2">
        <Button type="submit" disabled={!valid}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </span>
    </form>
  );
}

export function NameListSection({
  list,
  label,
  title,
  sub,
  editing,
}: {
  list: EditableList<EditableNameItem>;
  label: string;
  title: string;
  sub?: string;
  editing: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <Section label={label} title={title} sub={sub}>
      {list.items.length === 0 && (
        <EmptyNote>No bars in this list yet.</EmptyNote>
      )}
      <ul className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {list.items.map((item, i) => (
          <li
            key={item.id}
            className="rounded-xl border border-cream/16 bg-cream/6 px-4 py-3"
          >
            {editing && editingId === item.id ? (
              <NameItemForm
                initial={item}
                submitLabel="Save"
                onSubmit={(values) => {
                  list.update(item.id, values);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <span className="flex flex-col gap-2.5">
                <span className="flex items-start gap-2.5">
                  {editing && <RankBadge rank={i + 1} />}
                  <span className="min-w-0 flex-1">
                    <b className="text-cream">{item.name}</b>
                    {item.detail && (
                      <span className="block text-sm opacity-65">
                        {item.detail}
                      </span>
                    )}
                  </span>
                </span>
                {editing && (
                  <span className="flex flex-wrap items-center gap-2">
                    <MoveButtons
                      index={i}
                      count={list.items.length}
                      onMove={(dir) => list.move(item.id, dir)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="min-h-11 px-4 py-2 text-sm"
                      onClick={() => setEditingId(item.id)}
                    >
                      Edit
                    </Button>
                    <DeleteButton
                      name={item.name}
                      onDelete={() => list.remove(item.id)}
                    />
                  </span>
                )}
              </span>
            )}
          </li>
        ))}
      </ul>
      {editing && (
        <span className="mt-4 flex w-full flex-col gap-3">
          <span className="rounded-2xl border border-cream/16 bg-cream/6 p-5">
            <NameItemForm
              submitLabel="Add bar"
              onSubmit={(values) =>
                list.add({ id: newId("bar"), ...values })
              }
            />
          </span>
          <span>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (
                  window.confirm(
                    "Reset this list to the site defaults? Your edits to this list will be lost.",
                  )
                ) {
                  setEditingId(null);
                  list.reset();
                }
              }}
            >
              Reset list to site defaults
            </Button>
          </span>
        </span>
      )}
    </Section>
  );
}

/* ---------------- featured contenders ---------------- */

function ContenderForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: EditableContender;
  submitLabel: string;
  onSubmit: (values: {
    name: string;
    location: string;
    deal: string[];
    caveats: string[];
  }) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [deal, setDeal] = useState((initial?.deal ?? []).join("\n"));
  const [caveats, setCaveats] = useState((initial?.caveats ?? []).join("\n"));
  const valid = name.trim().length > 0;

  const lines = (value: string) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

  return (
    <form
      className="flex w-full flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({
          name: name.trim(),
          location: location.trim(),
          deal: lines(deal),
          caveats: lines(caveats),
        });
        if (!initial) {
          setName("");
          setLocation("");
          setDeal("");
          setCaveats("");
        }
      }}
    >
      <Field label="Bar name">
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bar name"
          aria-label="Bar name"
        />
      </Field>
      <Field label="Location">
        <input
          className={inputClass}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Address or neighborhood"
          aria-label="Location"
        />
      </Field>
      <Field label="Deal, one point per line">
        <textarea
          className={`${inputClass} min-h-24`}
          value={deal}
          onChange={(e) => setDeal(e.target.value)}
          aria-label="Deal, one point per line"
        />
      </Field>
      <Field label="Watch outs, one per line">
        <textarea
          className={`${inputClass} min-h-16`}
          value={caveats}
          onChange={(e) => setCaveats(e.target.value)}
          aria-label="Watch outs, one per line"
        />
      </Field>
      <span className="flex flex-wrap gap-2">
        <Button type="submit" disabled={!valid}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </span>
    </form>
  );
}

const card =
  "w-full rounded-2xl border border-cream/16 bg-cream/6 p-5 text-left";

export function ContenderCards({
  list,
  editing,
}: {
  list: EditableList<EditableContender>;
  editing: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <span className="flex w-full flex-col gap-4">
      {list.items.length === 0 && (
        <EmptyNote>No contenders yet.</EmptyNote>
      )}
      {list.items.map((c, i) => (
        <article key={c.id} className={card}>
          {editing && editingId === c.id ? (
            <ContenderForm
              initial={c}
              submitLabel="Save"
              onSubmit={(values) => {
                list.update(c.id, values);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-2.5">
                  {editing && <RankBadge rank={i + 1} />}
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-cream">{c.name}</h3>
                    <p className="text-sm font-bold opacity-60">{c.location}</p>
                  </div>
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
              {editing && (
                <span className="mt-3.5 flex flex-wrap items-center gap-2">
                  <MoveButtons
                    index={i}
                    count={list.items.length}
                    onMove={(dir) => list.move(c.id, dir)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11 px-4 py-2 text-sm"
                    onClick={() => setEditingId(c.id)}
                  >
                    Edit
                  </Button>
                  <DeleteButton
                    name={c.name}
                    onDelete={() => list.remove(c.id)}
                  />
                </span>
              )}
            </>
          )}
        </article>
      ))}
      {editing && (
        <span className="flex w-full flex-col gap-3">
          {adding ? (
            <span className={`${card} flex flex-col gap-3`}>
              <ContenderForm
                submitLabel="Add contender"
                onSubmit={(values) => {
                  list.add({ id: newId("contender"), ...values });
                  setAdding(false);
                }}
                onCancel={() => setAdding(false)}
              />
            </span>
          ) : (
            <Button type="button" variant="ghost" onClick={() => setAdding(true)}>
              Add contender
            </Button>
          )}
          <span>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (
                  window.confirm(
                    "Reset contenders to the site defaults? Your edits will be lost.",
                  )
                ) {
                  setEditingId(null);
                  setAdding(false);
                  list.reset();
                }
              }}
            >
              Reset contenders to site defaults
            </Button>
          </span>
        </span>
      )}
    </span>
  );
}
