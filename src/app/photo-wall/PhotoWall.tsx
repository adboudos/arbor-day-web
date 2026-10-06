"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import {
  createPhotoWallEntry,
  fetchEditions,
  fetchPhotoWall,
  photoWallUrl,
  uploadPhotoWallFile,
  type Edition,
  type PhotoWallRow,
} from "@/lib/supabase";

const MAX_FILE_MB = 10;

type Status = "idle" | "uploading" | "done";

export default function PhotoWall() {
  const [photos, setPhotos] = useState<PhotoWallRow[]>([]);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchPhotoWall(), fetchEditions()])
      .then(([wall, eds]) => {
        if (cancelled) return;
        setPhotos(wall);
        setEditions(eds);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const editionIdForYear = useMemo(() => {
    const map = new Map<number, string>();
    for (const ed of editions) map.set(ed.year, ed.id);
    return map;
  }, [editions]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Pick a photo first.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("That file is not an image. The wall only hangs photos.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Keep it under ${MAX_FILE_MB}MB.`);
      return;
    }
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Tell us who you are so we know who to thank.");
      return;
    }
    setStatus("uploading");
    try {
      const storagePath = await uploadPhotoWallFile(file);
      const editionId = year === "" ? null : (editionIdForYear.get(year) ?? null);
      await createPhotoWallEntry({
        edition_id: editionId,
        storage_path: storagePath,
        caption: caption.trim().slice(0, 140),
        uploader_name: cleanName.slice(0, 60),
      });
      // Auto-approved: refresh the wall so the new photo shows right away.
      const wall = await fetchPhotoWall();
      setPhotos(wall);
      setStatus("done");
      setName("");
      setCaption("");
      setYear("");
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setError("The upload failed. Check your connection and try again.");
      setStatus("idle");
    }
  }

  return (
    <main className="history-page">
      <header className="history-hero">
        <p className="history-kicker">
          <Link href="/">&larr; arborday.beer</Link>
        </p>
        <h1>Photo Wall</h1>
        <p className="history-tagline">
          Every Arbor Day, through everybody&apos;s lens.
        </p>
      </header>

      <section className="hof-section" aria-label="Add your photo">
        <h2>Hang yours</h2>
        <p className="hof-sub">
          Got a gem from a past party? Put it on the wall.
        </p>
        <form className="hof-form" onSubmit={handleSubmit}>
          <label className="hof-field">
            <span>Your name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              autoComplete="name"
            />
          </label>
          <label className="hof-field">
            <span>Which party</span>
            <select
              value={year}
              onChange={(e) =>
                setYear(e.target.value === "" ? "" : Number(e.target.value))
              }
            >
              <option value="">Not sure / other</option>
              {editions.map((ed) => (
                <option key={ed.year} value={ed.year}>
                  {ed.year} at {ed.venue}
                </option>
              ))}
            </select>
          </label>
          <label className="hof-field">
            <span>Caption (optional)</span>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What is happening here"
              maxLength={140}
            />
          </label>
          <label className="hof-field">
            <span>Photo</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              aria-label="Choose a photo to upload"
            />
          </label>
          <button
            type="submit"
            className="hof-btn"
            disabled={status === "uploading"}
          >
            {status === "uploading" ? "Hanging it up..." : "Add to the wall"}
          </button>
          {error && (
            <p className="hof-error" role="alert">
              {error}
            </p>
          )}
          {status === "done" && (
            <p className="hof-note" role="status">
              It is on the wall. Thanks for contributing.
            </p>
          )}
        </form>
      </section>

      <section className="hof-section" aria-label="The wall">
        <h2>The wall</h2>
        {loading ? (
          <p className="hof-empty">Unrolling the wall&hellip;</p>
        ) : photos.length === 0 ? (
          <p className="hof-empty">
            No photos yet. Yours could be the first one up here.
          </p>
        ) : (
          <div className="wall-grid">
            {photos.map((p) => (
              <figure key={p.id} className="wall-card">
                <img
                  src={photoWallUrl(p.storage_path)}
                  alt={p.caption || `Photo by ${p.uploader_name}`}
                  loading="lazy"
                />
                <figcaption>
                  {p.caption && <span className="wall-caption">{p.caption}</span>}
                  <span className="wall-meta">
                    {p.uploader_name}
                    {p.editions ? ` · ’${String(p.editions.year).slice(2)}` : ""}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      <footer className="history-footer">
        <Link href="/">&larr; Back to the countdown</Link>
      </footer>
    </main>
  );
}
