/**
 * The War Room: the 2027 venue hunt, classified edition.
 * Every venue below is under active consideration. None of this is real.
 * This page is intentionally unlinked and noindexed. Do not tell anyone.
 */

export interface JokeVenue {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  capacity: string;
  status: string;
  pro: string;
  con: string;
}

export const jokeVenues: JokeVenue[] = [
  {
    id: "wanda",
    name: "Wanda Metropolitano",
    location: "Madrid, Spain",
    lat: 40.4362,
    lng: -3.5995,
    capacity: "68,456 (room to grow)",
    status: "Front-runner",
    pro: "No drink minimum has been discussed. Or anything else. We have not called.",
    con: "4,200 miles from Lincoln Park. Attendees responsible for own flights.",
  },
  {
    id: "george",
    name: "The George Pub",
    location: "London, England",
    lat: 51.5072,
    lng: -0.1276,
    capacity: "~80 (standing, probably)",
    status: "Under consideration",
    pro: "Authenticity cannot be bought. It can, however, be flown to.",
    con: "Last tube home is midnight. Party ends at midnight. The math is unfortunate.",
  },
  {
    id: "hooleys",
    name: "Hooley's Irish Pub",
    location: "Guangzhou, China",
    lat: 23.1296,
    lng: 113.3215,
    capacity: "Three floors",
    status: "Scouting trip pending",
    pro: "A legitimate operation. Live music nightly, open until 2am, Guinness on tap.",
    con: "Level 2 has a RMB 500 minimum spend. The host fund is $200 each.",
  },
  {
    id: "nmh",
    name: "Northwestern Memorial Hospital",
    location: "Chicago, IL",
    lat: 41.8947,
    lng: -87.6217,
    capacity: "Several waiting rooms",
    status: "Dark horse",
    pro: "In-network for most guests. Extremely clean. Great lighting.",
    con: "BYOB policy is unclear and the staff seem stressed when asked.",
  },
  {
    id: "amazon",
    name: "The Amazon Rainforest",
    location: "Brazil",
    lat: -3.4653,
    lng: -62.2159,
    capacity: "Unlimited",
    status: "On theme",
    pro: "The decor is handled. The trees are already there.",
    con: "Open-container laws are unclear and the venue has no walls.",
  },
  {
    id: "baobab",
    name: "Sun Land Baobab Bar",
    location: "Limpopo, South Africa",
    lat: -23.6258,
    lng: 30.1079,
    capacity: "One very large tree",
    status: "Sentimental favorite",
    pro: "A bar inside a 6,000-year-old baobab tree.",
    con: "The tree is older than the concept of bars. It has seen things.",
  },
];
