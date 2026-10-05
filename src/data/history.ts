export interface TimelinePhoto {
  src: string;
  alt: string;
}

export interface Edition {
  year: number;
  /** e.g. "Friday, April 28, 2023" */
  date: string;
  venue: string;
  neighborhood: string;
  address: string;
  /** Map pin. Absent while the venue is still to be announced. */
  lat?: number;
  lng?: number;
  photos: TimelinePhoto[];
}

/**
 * Single source of truth for the /history timeline and venue map.
 * To add a year: append an entry. Photos live in public/history/.
 */
export const editions: Edition[] = [
  {
    year: 2023,
    date: "Friday, April 28, 2023",
    venue: "Kincade's",
    neighborhood: "Lincoln Park",
    address: "950 W Armitage Ave",
    lat: 41.91838,
    lng: -87.6529,
    photos: [
      { src: "/history/2023-kincades-1.jpg", alt: "The crew at the 2023 Arbor Day party at Kincade's" },
      { src: "/history/2023-kincades-2.jpg", alt: "Daytime hang before the 2023 Arbor Day party" },
    ],
  },
  {
    year: 2024,
    date: "Friday, April 26, 2024",
    venue: "Sluggers",
    neighborhood: "Wrigleyville",
    address: "3540 N Clark St",
    lat: 41.94651,
    lng: -87.65635,
    photos: [
      { src: "/history/2024-sluggers-1.jpg", alt: "Watching the NFL draft at the 2024 Arbor Day party at Sluggers" },
      { src: "/history/2024-sluggers-we-three-trees.jpg", alt: "We Three Trees meme from the 2024 Arbor Day party at Sluggers" },
    ],
  },
  {
    year: 2025,
    date: "Friday, April 25, 2025",
    venue: "Easy Bar",
    neighborhood: "East Village",
    address: "1944 W Chicago Ave",
    lat: 41.8962,
    lng: -87.67635,
    photos: [
      { src: "/history/2025-easybar-1.jpg", alt: "Dressed up at the 2025 Arbor Day party at Easy Bar" },
      { src: "/history/2025-easybar-2.jpg", alt: "Late night at the 2025 Arbor Day party at Easy Bar" },
    ],
  },
  {
    year: 2026,
    date: "Friday, April 24, 2026",
    venue: "Field House",
    neighborhood: "Lincoln Park",
    address: "2455 N Clark St",
    lat: 41.92698,
    lng: -87.64116,
    photos: [
      { src: "/history/2026-fieldhouse-1.jpg", alt: "The crew at the 2026 Arbor Day party at Field House" },
      {
        src: "/history/2026-fieldhouse-flyer.jpg",
        alt: "Hand-drawn flyer for the 2026 party: 5th annual Arbor Day, April 24, the Fieldhouse, 2455 N Clark St",
      },
    ],
  },
  {
    year: 2027,
    date: "Friday, April 30, 2027",
    venue: "To be announced",
    neighborhood: "",
    address: "",
    photos: [],
  },
];
