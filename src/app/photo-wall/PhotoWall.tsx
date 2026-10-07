"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  EmptyNote,
  ErrorNote,
  Field,
  FootNote,
  PageShell,
  Section,
  formPanel,
  inputClass,
} from "@/components/ui";
import {
  createPhotoWallEntry,
  fetchEditions,
  fetchPhotoWall,
  photoWallUrl,
  uploadPhotoWallFile,
  type Edition,
  type PhotoWallRow,
} from "@/lib/supabase";
import { PhotoProblem, preparePhoto } from "@/lib/photoUpload";

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
    // Settle both so one failing request doesn't blank out the other.
    Promise.allSettled([fetchPhotoWall(), fetchEditions()]).then(([wall, eds]) => {
      if (cancelled) return;
      if (wall.status === "fulfilled") setPhotos(wall.value);
      if (eds.status === "fulfilled") setEditions(eds.value);
      setLoading(false);
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

  // Only parties that have already happened can have photos.
  const pastEditions = useMemo(() => {
    const thisYear = new Date().getFullYear();
    return editions.filter((ed) => ed.year <= thisYear);
  }, [editions]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Pick a photo first.");
      return;
    }
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Tell us who you are so we know who to thank.");
      return;
    }
    setStatus("uploading");
    let stage: "prepare" | "upload" | "save" = "prepare";
    try {
      const photo = await preparePhoto(file);
      stage = "upload";
      const storagePath = await uploadPhotoWallFile(photo);
      stage = "save";
      const editionId = year === "" ? null : (editionIdForYear.get(year) ?? null);
      await createPhotoWallEntry({
        edition_id: editionId,
        storage_path: storagePath,
        caption: caption.trim().slice(0, 140),
        uploader_name: cleanName.slice(0, 60),
      });
      // Auto-approved: refresh the wall so the new photo shows right away.
      // The photo is already saved at this point, so a failed refresh is not an error.
      fetchPhotoWall().then(setPhotos).catch(() => {});
      setStatus("done");
      setName("");
      setCaption("");
      setYear("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error("Photo wall upload failed:", err);
      if (err instanceof PhotoProblem) setError(err.message);
      else if (stage === "save")
        setError("Your photo uploaded, but we couldn't hang it on the wall. Try again in a minute.");
      else setError("The upload failed. Check your connection and try again.");
      setStatus("idle");
    }
  }

  return (
    <PageShell title="Photo Wall" tagline={<>Every Arbor Day, through everybody&apos;s lens.</>}>
      <Section label="Add your photo" title="Hang yours" sub="Got a gem from a past party? Put it on the wall.">
        <form className={`${formPanel} max-w-104`} onSubmit={handleSubmit}>
          <Field label="Your name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              autoComplete="name"
              className={inputClass}
            />
          </Field>
          <Field label="Which party">
            <select
              value={year}
              onChange={(e) =>
                setYear(e.target.value === "" ? "" : Number(e.target.value))
              }
              className={inputClass}
            >
              <option value="">Not sure / other</option>
              {pastEditions.map((ed) => (
                <option key={ed.year} value={ed.year}>
                  {ed.year} at {ed.venue}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Caption (optional)">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What is happening here"
              maxLength={140}
              className={inputClass}
            />
          </Field>
          <Field label="Photo">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              aria-label="Choose a photo to upload"
              className={`${inputClass} file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-cream/15 file:px-2.5 file:py-1 file:font-bold file:text-cream`}
            />
          </Field>
          <Button type="submit" disabled={status === "uploading"}>
            {status === "uploading" ? "Hanging it up..." : "Add to the wall"}
          </Button>
          {error && <ErrorNote>{error}</ErrorNote>}
          {status === "done" && (
            <FootNote className="mt-3.5" role="status">
              It is on the wall. Thanks for contributing.
            </FootNote>
          )}
        </form>
      </Section>

      <Section label="The wall" title="The wall">
        {loading ? (
          <EmptyNote>Unrolling the wall&hellip;</EmptyNote>
        ) : photos.length === 0 ? (
          <EmptyNote>No photos yet. Yours could be the first one up here.</EmptyNote>
        ) : (
          <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
            {photos.map((p) => (
              <figure
                key={p.id}
                className="overflow-hidden rounded-xl border border-cream/16 bg-cream/6"
              >
                {/* Plain <img> on purpose: next/image optimization would bill per image on Vercel. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoWallUrl(p.storage_path)}
                  alt={p.caption || `Photo by ${p.uploader_name}`}
                  loading="lazy"
                  className="block h-48 w-full bg-forest-deep object-cover"
                />
                <figcaption className="flex flex-col gap-1 px-3.5 py-2.75">
                  {p.caption && <span className="text-base">{p.caption}</span>}
                  <span className="text-xs opacity-60">
                    {p.uploader_name}
                    {p.editions ? ` · ’${String(p.editions.year).slice(2)}` : ""}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Section>
    </PageShell>
  );
}
