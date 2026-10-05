import Link from "next/link";
import { PARTIFUL_URL } from "@/lib/site";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/history", label: "Past Parties" },
  { href: "/hall-of-fame", label: "Hall of Fame" },
  { href: "/ideas", label: "Ideas & Requests" },
  { href: "/photo-wall", label: "Photo Wall" },
  { href: "/war-room", label: "War Room" },
];

/** Quick menu linking every page. Drop it at the top of sub-pages. */
export default function SiteNav({ current }: { current?: string }) {
  return (
    <nav className="site-nav" aria-label="Site">
      {LINKS.map((l) =>
        l.href === current ? (
          <span key={l.href} className="site-nav-current" aria-current="page">
            {l.label}
          </span>
        ) : (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ),
      )}
    </nav>
  );
}
