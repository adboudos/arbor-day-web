/**
 * Admin dashboard data: venue hunt tracker + gimmicks board.
 * Hosts only. To update the page, edit this file and redeploy.
 */

export const STATUS_SUMMARY =
  "Venue not booked. Three contenders: Kirkwood, Ranalli's, Galway Arms. " +
  "Seven calls still on Quinn's list, eight forms awaiting reply.";

export interface Contender {
  name: string;
  location: string;
  deal: string[];
  caveats: string[];
}

export const contenders: Contender[] = [
  {
    name: "Kirkwood",
    location: "Lincoln Park",
    deal: ["Featured in the Sep 30 co-owner update."],
    caveats: ["Minimum and timing caveats (see the update email)."],
  },
  {
    name: "Ranalli's",
    location: "Lincoln Park",
    deal: ["Featured in the Sep 30 co-owner update."],
    caveats: [],
  },
  {
    name: "Galway Arms",
    location: "2442 N Clark St",
    deal: [
      "Upstairs free on Apr 30.",
      "$250 room fee per 3 hours, no minimum.",
      "Seats 40-50, max 65.",
      "Wristband needs everyone in the space to participate, otherwise cash bar is fine.",
    ],
    caveats: ["65-person cap is tight against ~100 turnout."],
  },
];

export interface ReplyEntry {
  venue: string;
  points: string[];
  note?: string;
}

export const replies: ReplyEntry[] = [
  {
    venue: "Lincoln Tap Room",
    points: [
      "Open Fri 3pm-2am.",
      "Packages A/B/C (+$5pp from 1/1/27).",
      "Package B, 3hr: $30pp now, $35pp after Jan 1. Fits the $40 cap.",
      "No room charges, deposits, or minimums.",
    ],
    note: "Quinn cut it from the featured contenders in the Sep 30 update.",
  },
  {
    venue: "Galway Arms (Alec)",
    points: [
      "Upstairs free Apr 30, $250 room fee per 3 hrs, no minimum.",
      "Seats 40-50 (max 65).",
    ],
  },
  {
    venue: "Will's Northwoods Inn",
    points: ["Redirected to the website parties form.", "No quote yet."],
  },
];

export interface ShortlistEntry {
  name: string;
  detail?: string;
}

export const shortlist: ShortlistEntry[] = [
  { name: "Brickhouse" },
  { name: "Schubas", detail: "Form submitted, awaiting reply" },
  { name: "J. Parker" },
  { name: "Clover", detail: "722 W Grand Ave, River West" },
  { name: "Big Star Wrigleyville" },
  { name: "Joe's on Weed St", detail: "940 W Weed; warehouse venue, live music, open late" },
  {
    name: "Old Pueblo Cantina",
    detail: "1200 W Webster; Cantina Room holds 75 standing, no venue fee, F&B minimums; closes 10:30pm Fri",
  },
  {
    name: "Lincoln Station",
    detail: "2432 N Lincoln; private room 50-125, buyout 250",
  },
  { name: "Kelly's Pub", detail: "949 W Webster; DePaul dive, beer garden" },
  {
    name: "Broken Barrel Bar",
    detail: "2548 N Southport; beer garden; private events via Tock form",
  },
  {
    name: "Wrigley View Rooftop",
    detail: "1050 W Waveland; all-inclusive model, flag the cost",
  },
  {
    name: "Wrigley Rooftops LLC",
    detail: "3619 N Sheffield; cap ~200 across 11 rooftops",
  },
  { name: "Gunny's Pub", detail: "2642 N Lincoln; opened Sep 2026" },
  { name: "Bookclub Chicago", detail: "2871 N Lincoln; former Elbo Room, ~300 cap" },
  {
    name: "Kingston Mines",
    detail: "Blues Hall 150 / Doc's Room 50 / buyout 400; party@kingstonmines.com",
  },
];

export interface OutreachEntry {
  name: string;
  contact: string;
}

export const phoneOnly: OutreachEntry[] = [
  { name: "Kincade's Wrigley", contact: "(773) 348-0010" },
  { name: "Gunny's", contact: "(773) 871-1600" },
  { name: "Lincoln Station", contact: "(773) 472-8100" },
  { name: "Kelly's Pub", contact: "(773) 281-0656" },
  { name: "Delilah's", contact: "(773) 472-2771" },
  { name: "Park West", contact: "(773) 929-1322" },
  { name: "Wrigley Rooftops", contact: "(773) 248-7663" },
];

export const formOnly: string[] = [
  "Schubas",
  "Old Pueblo",
  "Rizzo's",
  "Swift Tavern",
  "Mordecai",
  "Lincoln Hall",
  "Bookclub",
  "Broken Barrel (Tock)",
];

export const deadVenues: ShortlistEntry[] = [
  { name: "Theatre on the Lake", detail: "Booked Apr 30, 2027" },
  { name: "The Irish Oak", detail: "Permanently closed since Jul 2023" },
  { name: "Half Acre Balmoral", detail: "40-guest private event cap" },
  { name: "O'Malley's West", detail: "Closed" },
  { name: "Goose Island Clybourn", detail: "Closed" },
  { name: "Dunlay's on Clark", detail: "Closed" },
  { name: "B.L.U.E.S. on Halsted", detail: "Closed" },
];

export const droppedVenues: string[] = [
  "Ten Cat",
  "Pony",
  "Replay",
  "Moe's",
  "Port & Park",
  "Tapster",
  "Tin Roof",
  "McGee's",
  "Stretch",
  "Output",
  "Cesars",
  "Country Club",
  "Salt Shed",
  "Sports Corner",
  "Parlay",
  "Bird's Nest Bar",
  "Halligan Bar",
  "Local Option",
  "Burwood Tap",
  "Duke's Bar & Grill",
  "Howl at the Moon",
  "Headquarters Beercade",
  "Buddy Guy's Legends",
  "Emporium Arcade Bar",
  "Three Dots and a Dash",
  "Thalia Hall Punch House",
  "Zanies Comedy Club",
  "Green Door Tavern / The Drifter",
  "WhirlyBall",
  "The Reveler",
  "Benchmark",
  "Fatpour Tap Works Wicker Park",
  "The Fifty/50",
  "Smoke Daddy",
  "Riverview Tavern",
  "Fat Cat",
  "Olde Town Pub",
  "Atlantic Bar & Grill",
  "Corcoran's",
  "The Owl",
  "Four Treys Tavern",
  "John Barleycorn LP",
  "Cafe Ba-Ba-Reeba",
  "Tonic Room (now Golden Dagger)",
];

export const criteria: string[] = [
  "$40 per person max on wristband or drink packages.",
  "No host tab. Guests pay their own way.",
  "Unique, bar-esque venues (tiki, arcade, live music, historic tavern, taproom, rooftop). Not formal event spaces.",
  "All of Chicago is fair game, not just Lincoln Park and Lakeview.",
  "Keep host cost as close to zero as possible.",
];

export const principles: string[] = [
  "Getting Drunk",
  "Celebrating Trees",
  "Dressing Formal",
];

export type GimmickStatus = "done" | "proposed" | "idea";

export interface Gimmick {
  name: string;
  description: string;
  status: GimmickStatus;
  year?: string;
}

export const gimmicks: Gimmick[] = [
  {
    name: "Live band",
    description: "2025 at Easy Bar.",
    status: "done",
    year: "2025",
  },
  {
    name: "Seed packets",
    description: "The famous seed packets.",
    status: "done",
  },
  {
    name: "Party favors",
    description: "2025.",
    status: "done",
    year: "2025",
  },
  {
    name: "First-time attendee stickers",
    description: "Sticker for newcomers at the door.",
    status: "proposed",
  },
  {
    name: "5x repeat attendee stickers",
    description:
      "Loyalty tier for guests who have attended five previous parties. Honor system.",
    status: "proposed",
  },
  {
    name: "Seed mailer via the site",
    description: "Enter your address on arborday.beer, get seeds in the mail.",
    status: "idea",
  },
];
