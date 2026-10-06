import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Small shared building blocks for the sub-pages. Everything is plain
 * Tailwind; these exist only so the same handful of patterns (page frame,
 * stat tiles, form fields, buttons) aren't copy-pasted across five pages.
 */

/** Sub-page frame: glow background, back link, title block, and footer link home. */
export function PageShell({
  title,
  tagline,
  badge,
  children,
}: {
  title: ReactNode;
  tagline: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="flex w-full flex-1 flex-col bg-[radial-gradient(circle_at_50%_0%,var(--color-moss)_0,var(--color-forest)_70%)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-5 pt-16 pb-12">
        <header className="mb-8 flex flex-col items-center gap-3.5 text-center">
          <p className="text-base">
            <Link href="/" className="font-bold text-leaf hover:text-amber">
              &larr; arborday.beer
            </Link>
          </p>
          {badge}
          <h1 className="text-[clamp(2.6rem,9vw,4.5rem)] leading-[.9] tracking-[-.02em] text-cream">
            {title}
          </h1>
          <p className="max-w-136 text-base opacity-85">{tagline}</p>
        </header>

        {children}

        <footer className="mt-8 text-base">
          <Link href="/" className="font-bold text-leaf hover:text-amber">
            &larr; Back to the countdown
          </Link>
        </footer>
      </div>
    </main>
  );
}

/** A titled, centered page section. */
export function Section({
  label,
  title,
  sub,
  children,
}: {
  label: string;
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 flex w-full flex-col items-center" aria-label={label}>
      <h2 className="text-[clamp(1.8rem,6vw,2.6rem)] text-cream">{title}</h2>
      {sub && <p className="mt-1.25 mb-4.75 text-center text-base opacity-75">{sub}</p>}
      {children}
    </section>
  );
}

/** Translucent number tile used in the stat rows. */
export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="min-w-36 rounded-xl border border-cream/18 bg-cream/8 px-4.5 py-3.25 text-center">
      <b className="block text-[1.7rem] text-amber tabular-nums">{value}</b>
      <span className="text-xs tracking-[.12em] uppercase opacity-80">{label}</span>
    </div>
  );
}

/** Frosted card that wraps a form. Pass a max width via className. */
export const formPanel =
  "flex w-full flex-col gap-3.25 rounded-2xl border border-cream/16 bg-cream/6 p-5";

/** Text inputs, selects, and textareas on the dark background. */
export const inputClass =
  "rounded-lg border border-cream/30 bg-forest/60 px-3.5 py-2.75 text-base text-cream placeholder:text-cream/40 [&_option]:text-forest";

/** Labelled form control with the small uppercase caption above it. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.25 text-left">
      <span className="text-xs font-bold tracking-[.14em] uppercase opacity-70">{label}</span>
      {children}
    </label>
  );
}

const buttonVariants = {
  primary: "border-0 bg-amber text-forest hover:brightness-[1.08]",
  /** Outline button for the dark page background. */
  ghost: "border border-cream/40 bg-transparent text-cream",
  /** Outline button for use on a cream card. */
  ghostOnCream: "border border-forest/40 bg-transparent text-forest",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonVariants }) {
  return (
    <button
      className={`cursor-pointer rounded-xl px-4.75 py-3.25 text-base font-black disabled:cursor-wait disabled:opacity-60 ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}

/** Inline error callout for forms. */
export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p
      className="rounded-xl border border-ember/50 bg-ember/12 px-3.5 py-2.75 text-base text-ember-light"
      role="alert"
    >
      {children}
    </p>
  );
}

/** Italic placeholder for loading and empty states. */
export function EmptyNote({
  children,
  className = "",
  role,
}: {
  children: ReactNode;
  className?: string;
  role?: string;
}) {
  return (
    <p className={`text-center italic opacity-70 ${className}`} role={role}>
      {children}
    </p>
  );
}

/** Small muted footnote under a form or list. */
export function FootNote({
  children,
  className = "",
  role,
}: {
  children: ReactNode;
  className?: string;
  role?: string;
}) {
  return (
    <p className={`text-center text-sm opacity-60 ${className}`} role={role}>
      {children}
    </p>
  );
}
