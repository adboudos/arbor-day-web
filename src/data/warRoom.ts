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
  blurb: string;
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
    blurb:
      "Big venue energy for a 120-person headcount. The acoustics would be wasted on us, but the photos would be incredible.",
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
    blurb:
      "A proper pub. Historic. They have been pouring since before Arbor Day was invented (1872, look it up).",
    pro: "Authenticity cannot be bought. It can, however, be flown to.",
    con: "Last tube home is midnight. Party ends at midnight. The math is unfortunate.",
  },
  {
    id: "guangzhou",
    name: "A Random Irish Pub",
    location: "Guangzhou, China",
    lat: 23.1291,
    lng: 113.2644,
    capacity: "Unknown. We will count chairs when we get there.",
    status: "Scouting trip pending",
    blurb:
      "Which one? Unclear. There is at least one, and that is enough to begin the process.",
    pro: "Nobody in the group can veto a bar they cannot find on Google Maps.",
    con: "The 13-hour time difference makes the countdown timer confusing.",
  },
  {
    id: "nmh",
    name: "Northwestern Memorial Hospital",
    location: "Chicago, IL",
    lat: 41.8947,
    lng: -87.6217,
    capacity: "Several waiting rooms",
    status: "Dark horse",
    blurb:
      "Hear us out. Centrally located, open late, and the valet situation is excellent.",
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
    blurb:
      "More trees than any venue in the history of the party. Thematically unbeatable.",
    pro: "The decor is handled. The trees are already there.",
    con: "Mosquitoes do not respect a blazer. Formal dress code difficult to enforce.",
  },
  {
    id: "baobab",
    name: "Sun Land Baobab Bar",
    location: "Limpopo, South Africa",
    lat: -23.6258,
    lng: 30.1079,
    capacity: "One very large tree",
    status: "Sentimental favorite",
    blurb:
      "A bar inside a 6,000-year-old baobab tree. It is literally Arbor Day in bar form.",
    pro: "You cannot get more on theme than drinking inside a tree.",
    con: "The tree is older than the concept of bars. It has seen things.",
  },
];
