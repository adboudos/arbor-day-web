// Past Arbor Day editions. The /history timeline renders entirely from this
// array — to add a new year, append one object here. Nothing about the graphic
// itself is hardcoded in the page.

export interface EditionStat {
  label: string;
  value: string;
}

export interface Edition {
  year: number;
  venue: string;
  neighborhood: string;
  date: string;
  deal: string;
  stats: EditionStat[];
  highlights: string[];
  /** The upcoming edition renders as a "to be continued" card. */
  upcoming?: boolean;
}

export const editions: Edition[] = [
  {
    year: 2023,
    venue: "Kincade's",
    neighborhood: "Lincoln Park",
    date: "Friday, April 28, 2023",
    deal: "Minimum deal",
    stats: [],
    highlights: ["The one that started it all."],
  },
  {
    year: 2024,
    venue: "Sluggers",
    neighborhood: "Wrigleyville",
    date: "Friday, April 26, 2024",
    deal: "Back bar · ~$200 fee, believed waived",
    stats: [],
    highlights: ["Back-bar takeover in the heart of Wrigleyville."],
  },
  {
    year: 2025,
    venue: "Easy Bar",
    neighborhood: "Chicago",
    date: "Friday, April 25, 2025 · 8:30pm",
    deal: "Back Room · minimum deal",
    stats: [{ label: "Guests", value: "50–60" }],
    highlights: [
      "Cash bar, individual tabs — no host tab.",
      "Live band, seed packets, and party favors.",
      "Guiding principles: getting drunk, celebrating trees, dressing formal.",
    ],
  },
  {
    year: 2026,
    venue: "Field House",
    neighborhood: "Chicago",
    date: "Friday, April 24, 2026",
    deal: "Full buyout · free",
    stats: [
      { label: "Headcount", value: "120" },
      { label: "Invited", value: "104" },
      { label: "Out-of-towners", value: "16" },
      { label: "Groups", value: "32" },
    ],
    highlights: ["Whole-bar buyout at zero cost.", "Biggest crowd yet."],
  },
  {
    year: 2027,
    venue: "To be announced",
    neighborhood: "Chicago",
    date: "Friday, April 30, 2027 · 9pm–midnight",
    deal: "In the works",
    stats: [],
    highlights: [],
    upcoming: true,
  },
];
