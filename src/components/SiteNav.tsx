"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/history", label: "Past Parties" },
  { href: "/hall-of-fame", label: "Hall of Fame" },
  { href: "/ideas", label: "Ideas & Requests" },
  { href: "/photo-wall", label: "Photo Wall" },
  { href: "/arbor-trail", label: "Arbor Trail" },
  { href: "/war-room", label: "War Room" },
];

const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber focus-visible:rounded";

/** Top bar: "Arbor Day" home link on the left, hamburger dropdown on the right. */
export default function SiteNav({ current }: { current?: string }) {
  const pathname = usePathname();
  const active = current ?? pathname;
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close on outside click or Escape while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const bar = "block h-[3px] w-6 rounded-sm bg-cream transition-all duration-200";

  return (
    <nav
      ref={navRef}
      aria-label="Site"
      className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-cream/10 bg-forest/90 px-5 pb-[0.9rem] pt-[calc(0.9rem+env(safe-area-inset-top,0px))] text-cream backdrop-blur"
    >
      <Link
        href="/"
        onClick={() => setOpen(false)}
        className={`text-xl font-extrabold text-amber no-underline ${focusRing}`}
      >
        Arbor Day
      </Link>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="site-nav-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className={`-m-2.5 flex cursor-pointer flex-col gap-[5px] border-0 bg-transparent p-2.5 ${focusRing}`}
      >
        <span className={`${bar} ${open ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`${bar} ${open ? "opacity-0" : ""}`} />
        <span className={`${bar} ${open ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      {open && (
        <ul
          id="site-nav-menu"
          className="absolute right-5 top-full m-0 min-w-52 list-none rounded-xl bg-cream p-1.5 text-forest shadow-menu"
        >
          {LINKS.map((l) => {
            const isActive = l.href === active;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3.5 py-3 font-bold no-underline ${
                    isActive
                      ? "bg-forest text-cream"
                      : "hover:bg-forest/10 focus-visible:bg-forest/10"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
