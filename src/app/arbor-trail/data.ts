// Game content for The Arbor Day Trail. All tunables live here so new events,
// landmarks, and shop items can be added by editing data only. No em dashes
// anywhere in copy, per the house rules.

export type PaceId = "sipping" | "steady" | "sending";
export type RationId = "rounds" | "justme" | "nursing";
export type ClassId = "veteran" | "regular" | "rookie";
export type MemberStatus = "sober" | "tipsy" | "drunk" | "gone";

export interface CrewMember {
  name: string;
  tolerance: number;
  charm: number;
  status: MemberStatus;
  personalityId: string;
}

export interface DrinkingClass {
  id: ClassId;
  name: string;
  blurb: string;
  money: number;
  tolerance: number;
  multiplier: number;
}

export interface Pace {
  id: PaceId;
  name: string;
  blurb: string;
  beersPerTurn: number;
  dignityDrain: number;
  eventChance: number;
  wobbleChance: number;
}

export interface Ration {
  id: RationId;
  name: string;
  blurb: string;
  costPerTurn: number;
  beerMod: number;
  dignityMod: number;
}

export interface Landmark {
  turn: number;
  name: string;
  year: string;
  blurb: string;
  shop: boolean;
  final?: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  desc: string;
  minTurn?: number;
}

export interface ChoiceResult {
  text: string;
  beers?: number;
  money?: number;
  dignity?: number;
  soberUp?: boolean;
  riskDrunk?: number;
  pretzel?: number;
  chance?: number;
  alt?: ChoiceResult;
}

export interface EventChoice {
  label: string;
  sub?: string;
  cost?: number;
  result: ChoiceResult;
}

export interface TrailEvent {
  id: string;
  text: string;
  minTurn?: number;
  choices: EventChoice[];
}

export interface ToastOption {
  text: string;
  success: string;
  fail: string;
}

export const GOAL_BEERS = 50;
export const TOTAL_TURNS = 12;
export const TURN_MINUTES = 15;

export const CLASSES: DrinkingClass[] = [
  {
    id: "veteran",
    name: "The Veteran",
    blurb: "Six Arbor Days deep. Starts with $200 and a liver of legend. Score x1.",
    money: 200,
    tolerance: 7,
    multiplier: 1,
  },
  {
    id: "regular",
    name: "The Regular",
    blurb: "Knows the bartenders by name. Starts with $120. Score x2.",
    money: 120,
    tolerance: 5,
    multiplier: 2,
  },
  {
    id: "rookie",
    name: "The Rookie",
    blurb: "First Arbor Day. Starts with $60 and no tolerance. Finish and score x3.",
    money: 60,
    tolerance: 3,
    multiplier: 3,
  },
];

export const PACES: Pace[] = [
  {
    id: "sipping",
    name: "Sipping",
    blurb: "+2 beers a turn. Safe, slow, and 50 is a long way off.",
    beersPerTurn: 2,
    dignityDrain: 2,
    eventChance: 0.3,
    wobbleChance: 0.05,
  },
  {
    id: "steady",
    name: "Steady",
    blurb: "+4 beers a turn. The classic pace. Respectable risk.",
    beersPerTurn: 4,
    dignityDrain: 4,
    eventChance: 0.45,
    wobbleChance: 0.15,
  },
  {
    id: "sending",
    name: "Sending It",
    blurb: "+6 beers a turn. 50 is easy. Survival is not.",
    beersPerTurn: 6,
    dignityDrain: 8,
    eventChance: 0.6,
    wobbleChance: 0.35,
  },
];

export const RATIONS: Ration[] = [
  {
    id: "rounds",
    name: "Rounds for everyone",
    blurb: "$15 a turn, +1 beer, and the crew loves you (+2 dignity).",
    costPerTurn: 15,
    beerMod: 1,
    dignityMod: 2,
  },
  {
    id: "justme",
    name: "Just for me",
    blurb: "$8 a turn. Nobody judges. Everyone judges.",
    costPerTurn: 8,
    beerMod: 0,
    dignityMod: 0,
  },
  {
    id: "nursing",
    name: "Nursing one beer",
    blurb: "$2 a turn, -1 beer. The coward's ration.",
    costPerTurn: 2,
    beerMod: -1,
    dignityMod: 0,
  },
];

export const LANDMARKS: Landmark[] = [
  {
    turn: 0,
    name: "Your Apartment",
    year: "9:00 PM",
    blurb: "The crew assembles. Shoes are on. The night is young and so are your livers.",
    shop: false,
  },
  {
    turn: 3,
    name: "Kincade's LP",
    year: "2023",
    blurb: "First stop on the trail. Someone immediately tells the 2023 story. You let them.",
    shop: true,
  },
  {
    turn: 5,
    name: "Sluggers",
    year: "2024",
    blurb: "The back bar looks exactly the same. The crew feels two years younger.",
    shop: true,
  },
  {
    turn: 7,
    name: "Easy Bar",
    year: "2025",
    blurb: "You feel a disturbance. It is the ghost of minimum spends past.",
    shop: true,
  },
  {
    turn: 9,
    name: "Field House",
    year: "2026",
    blurb: "Site of the legendary full buyout. The bartender nods. She remembers.",
    shop: true,
  },
  {
    turn: 12,
    name: "The 2027 Venue",
    year: "???",
    blurb: "The Promised Land. If you can still stand, you have made it.",
    shop: false,
    final: true,
  },
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "water",
    name: "Water for the crew",
    cost: 10,
    desc: "One member sobers up a level. +5 dignity.",
  },
  {
    id: "pretzel",
    name: "Pretzel necklace",
    cost: 8,
    desc: "Halves dignity drain for 3 turns. Fashion and function.",
  },
  {
    id: "mystery",
    name: "Mystery shot",
    cost: 5,
    desc: "+3 beers. One random member gets drunker.",
  },
  {
    id: "burrito",
    name: "Hair-of-the-dog burrito",
    cost: 12,
    desc: "+15 dignity. A medical marvel.",
    minTurn: 7,
  },
];

export const TOASTS: ToastOption[] = [
  {
    text: "To trees: may we always have something worth celebrating.",
    success: "The bar raises a glass. +8 dignity. A perfect toast.",
    fail: "You choked halfway through. The bar applauded politely. -5 dignity.",
  },
  {
    text: "To the crew: 50 beers or bust.",
    success: "The crew roars. +10 dignity, +2 beers. This is why you came.",
    fail: "Someone yelled 'bust' immediately. -5 dignity, but +2 beers anyway.",
  },
  {
    text: "To every venue that ever hosted us: never forget.",
    success: "A moment of genuine emotion. +8 dignity, +1 beer.",
    fail: "You forgot a venue name. The crew will never let it go. -5 dignity.",
  },
];

export const TOMBSTONE_CAUSES = [
  "the spins",
  "karaoke",
  "a bad shot",
  "the bouncer's judgment",
  "surge pricing despair",
  "the worm (it did not land)",
  "tequila",
  "their own confidence",
  "the jukebox",
  "a competing toast",
];

/* ---------------- dive bar detours ---------------- */

export interface DiveBar {
  name: string;
  blurb: string;
}

export const DIVE_BARS: DiveBar[] = [
  {
    name: "The Rusty Anchor",
    blurb: "The windows are painted black. The regulars are painted drunker.",
  },
  {
    name: "Lucky's Last Call",
    blurb: "Cash only. The ATM charges $4. The shots cost $3.",
  },
  {
    name: "The Wet Whistle",
    blurb: "The jukebox plays one song. Nobody remembers what it is anymore.",
  },
  {
    name: "Big Ed's Basement",
    blurb: "It is technically a basement. It is technically a bar. Both are true.",
  },
  {
    name: "The Copper Mug",
    blurb: "The mugs are copper. The floors are sticky. The pours are honest.",
  },
  {
    name: "Sal's Eternal Happy Hour",
    blurb: "Happy hour never ended here. Neither did 2019.",
  },
  {
    name: "The Leaky Faucet",
    blurb: "Drip, drip, drip. The ceiling is crying. The beer is cheap.",
  },
  {
    name: "Goldie's",
    blurb: "No one named Goldie has worked here since 1987. The name stays.",
  },
  {
    name: "The Smoky Mirror",
    blurb: "You look great in this mirror. Everyone does. That is the point.",
  },
  {
    name: "Pat's Place",
    blurb: "No apostrophe. Pat was clear about that. Do not ask about Pat.",
  },
  {
    name: "The Bottomless Ashtray",
    blurb: "Smoking indoors ended years ago. The ashtray remains, as a warning.",
  },
  {
    name: "Ziggy's",
    blurb: "Ziggy will remember your order forever. Ziggy will forget your name instantly.",
  },
];

export const DETOUR_COST = 6;
export const DETOUR_BEERS = 5;

/* ---------------- crew personalities ----------------
   Banter lines support {other}, {leader}, {beers}, {clock}. */

export interface Personality {
  id: string;
  name: string;
  lines: string[];
}

export const PERSONALITIES: Personality[] = [
  {
    id: "hype",
    name: "Hype Man",
    lines: [
      "LETS GOOO! {other}, you are walking like a champion right now.",
      "Best night of our lives and it is only {clock}. Think about that.",
      "I have never been more alive. {leader}, keep leading!",
      "Fifty beers? That is just the warmup.",
      "Look at this crew. LOOK AT US.",
      "{other} just power-walked past a pretzel cart without stopping. Legend behavior.",
      "My blood is forty percent foam right now.",
      "If we do not make it to midnight, we die as heroes!",
    ],
  },
  {
    id: "skeptic",
    name: "The Skeptic",
    lines: [
      "There is no way we hit fifty. I am just saying.",
      "{other}, you said the exact same thing in 2024.",
      "This pace is unsustainable and everyone knows it.",
      "I am not drunk, I am just disappointed in our strategy.",
      "Fifty beers was {leader}'s idea. Remember that at midnight.",
      "The math is not mathing.",
      "I will believe the 2027 venue exists when I see it.",
      "Nobody's dignity survives Clark Street. Nobody.",
    ],
  },
  {
    id: "philosopher",
    name: "The Philosopher",
    lines: [
      "You ever think about how trees just stand there? All day? {other}, back me up here.",
      "Arbor Day is really about the friends we hydrated along the way.",
      "Beer is just bread that believed in itself.",
      "What if the trail is the friends? No wait. The trail is definitely the bars.",
      "Every beer is a small funeral for sobriety.",
      "The stars are out. Or those are streetlights. Either way: beautiful.",
      "{leader}, do you think the trees know we party for them?",
      "Time is a flat circle. So is this pretzel I am eating.",
    ],
  },
  {
    id: "mom",
    name: "Mom Friend",
    lines: [
      "Did everyone drink water? {other}, I am looking at you.",
      "I brought extra pretzels. Take one. TAKE ONE.",
      "Text me when you get to the next bar. Actually I will just watch you walk.",
      "{leader}, slow down. You are going to trip on literally nothing.",
      "Has anyone seen my dignity? I had it at Kincade's.",
      "Eat something. The burrito guy is right there.",
      "I am not mad, I am just disappointed we are only at {beers} beers.",
      "Shoes tied? Laces kill more nights than shots do.",
    ],
  },
  {
    id: "wildcard",
    name: "The Wildcard",
    lines: [
      "I just high-fived a parking meter. It deserved it.",
      "What if we run the rest of the way? I am serious. {other}, race me.",
      "I know a guy who knows a guy who tends bar at the 2027 venue.",
      "Bet you I cannot chug this. Bet you I CAN.",
      "The moon is doing something weird tonight. Do not look directly at it.",
      "I just Venmo-requested a pigeon four dollars.",
      "{leader}, give me your shoes. Trust me.",
      "New rule: every third step is a little dance.",
    ],
  },
  {
    id: "nostalgist",
    name: "The Nostalgist",
    lines: [
      "Back at Arbor Day '23, Kincade's had this exact smell.",
      "You rookies do not know how good you have it. We used to walk UPHILL to Sluggers.",
      "'24 at Sluggers. Now THAT was a back bar.",
      "Easy Bar '25. I still think about that night.",
      "The Field House buyout last year? Peak civilization.",
      "{other}, you were not even there in '23. You do not know.",
      "They do not make bar nights like they used to. Except this one. This one is good.",
      "Six years of this. Six. {leader}, we are basically historians.",
    ],
  },
];

export const DEFAULT_NAMES = ["Quinn", "Jason", "Boudos", "Rando", "Plus-One"];

export interface Achievement {
  id: string;
  name: string;
  desc: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "conqueror", name: "Trail Conqueror", desc: "Reach midnight with 50 beers." },
  { id: "sending-survivor", name: "Sending It Survivor", desc: "Win on Sending It pace." },
  { id: "untouchable", name: "Untouchable", desc: "Win with the whole crew standing." },
  { id: "rookie-year", name: "Rookie of the Year", desc: "Win as The Rookie." },
  { id: "exact-50", name: "Exactly 50", desc: "Finish with exactly 50 beers." },
  { id: "high-roller", name: "High Roller", desc: "Win with $100 still in pocket." },
  { id: "dignified", name: "Dignified", desc: "Win with 90+ dignity." },
  { id: "fumes", name: "Running on Fumes", desc: "Win with under 25 dignity." },
];

export const EVENTS: TrailEvent[] = [
  {
    id: "karaoke",
    text: "The DJ announces karaoke. Your name is somehow already on the list.",
    choices: [
      {
        label: "Embrace it",
        sub: "Full commitment",
        result: {
          text: "You sang with total commitment. The bar sang along. Your dignity did not survive, but the round did.",
          beers: 4,
          dignity: -10,
          riskDrunk: 1,
        },
      },
      {
        label: "Fake a phone call",
        sub: "The coward's exit",
        result: {
          text: "You hid near the bathrooms for ten minutes. Cowardice, but effective.",
        },
      },
      {
        label: "Nominate a crewmate",
        sub: "Throw someone else in",
        result: {
          text: "You volunteered a crewmate. They will remember this. The bar loved it.",
          beers: 2,
          riskDrunk: 1,
        },
      },
    ],
  },
  {
    id: "ex",
    text: "Your ex just walked in. With someone new.",
    choices: [
      {
        label: "Buy a round of shots",
        sub: "Costs $20",
        cost: 20,
        result: {
          text: "Liquid courage. It did not help, but it was delicious.",
          beers: 3,
          dignity: -5,
        },
      },
      {
        label: "Play it cool",
        sub: "The high road",
        result: {
          text: "You nodded. They nodded. Everyone survived.",
          dignity: 5,
        },
      },
      {
        label: "Leave immediately",
        sub: "Tactical retreat",
        result: {
          text: "The crew calls it a tactical retreat. It was not tactical.",
          dignity: -5,
        },
      },
    ],
  },
  {
    id: "pizza",
    text: "A pizza just arrived at the bar. Nobody ordered it. It is a gift from the universe.",
    choices: [
      {
        label: "Inhale it",
        sub: "Costs $5",
        cost: 5,
        result: {
          text: "Grease: the great stabilizer. The crew steadies.",
          dignity: 12,
        },
      },
      {
        label: "Save it for later",
        sub: "Delayed gratification",
        result: {
          text: "Remarkable restraint. The pizza waits. So does your dignity.",
          dignity: 5,
        },
      },
    ],
  },
  {
    id: "stranger-shots",
    text: "A stranger has ordered a round of shots for the crew.",
    choices: [
      {
        label: "Accept",
        sub: "Free shots",
        result: {
          text: "Free shots. The best shots.",
          beers: 3,
          riskDrunk: 1,
        },
      },
      {
        label: "Decline politely",
        sub: "Discipline",
        result: {
          text: "Discipline. Boring, but discipline.",
          dignity: 3,
        },
      },
    ],
  },
  {
    id: "phone",
    text: "You cannot find your phone.",
    choices: [
      {
        label: "Retrace your steps",
        sub: "The full search",
        result: {
          text: "Found it in your back pocket. A classic.",
          dignity: -5,
        },
      },
      {
        label: "Call it from a friend's phone",
        sub: "Team effort",
        result: {
          text: "It was on silent under a napkin. Crisis averted.",
          dignity: 2,
        },
      },
    ],
  },
  {
    id: "jukebox",
    text: "The jukebox is playing your song.",
    choices: [
      {
        label: "Rush the jukebox",
        sub: "Take control",
        result: {
          text: "You queued six more songs. This is leadership.",
          dignity: 8,
          beers: 2,
        },
      },
      {
        label: "Request the worst song you know",
        sub: "Costs $5",
        cost: 5,
        result: {
          text: "Chaos. Beautiful chaos. The bar is furious and delighted.",
          dignity: -8,
          beers: 4,
        },
      },
    ],
  },
  {
    id: "armwrestle",
    text: "A stranger challenges the crew's strongest to arm wrestling.",
    choices: [
      {
        label: "Accept the challenge",
        sub: "50/50 glory",
        result: {
          text: "Victory! The table erupts. Your arm will hurt tomorrow.",
          dignity: 10,
          beers: 2,
          chance: 0.5,
          alt: {
            text: "Defeat. Swift and public. The stranger buys you a pity beer.",
            dignity: -5,
            beers: 1,
          },
        },
      },
      {
        label: "Decline gracefully",
        sub: "Live to fight never",
        result: {
          text: "Some battles are not worth fighting. This was one of them.",
          dignity: 2,
        },
      },
    ],
  },
  {
    id: "lastcall",
    text: "The bartender yells last call.",
    minTurn: 10,
    choices: [
      {
        label: "Order doubles",
        sub: "Costs $25",
        cost: 25,
        result: {
          text: "One for now, one for the road. The road is 20 feet long.",
          beers: 6,
          riskDrunk: 2,
        },
      },
      {
        label: "Accept fate",
        sub: "Make peace",
        result: {
          text: "You have made peace with closing time. Growth.",
          dignity: 5,
        },
      },
    ],
  },
  {
    id: "bouncer",
    text: "The bouncer is giving the crew a long, slow look.",
    choices: [
      {
        label: "Charm him",
        sub: "Risky",
        result: {
          text: "He laughs, stamps your hands, and waves you in. Natural charisma.",
          dignity: 5,
          chance: 0.6,
          alt: {
            text: "He did not laugh. Cover is $20 and he remembers your face.",
            money: -20,
            dignity: -5,
          },
        },
      },
      {
        label: "Pay the cover",
        sub: "Costs $20, no drama",
        cost: 20,
        result: {
          text: "Money solves the problem money created.",
        },
      },
      {
        label: "Walk around the block",
        sub: "Regroup",
        result: {
          text: "The cold air sobered exactly nobody.",
          dignity: -5,
        },
      },
    ],
  },
  {
    id: "longtoast",
    text: "A man at the next table is giving a toast. It is very, very long.",
    choices: [
      {
        label: "Listen respectfully",
        sub: "Patience",
        result: {
          text: "It finally ended. You feel like a better person.",
          dignity: 4,
        },
      },
      {
        label: "Start a competing toast",
        sub: "Chaos",
        result: {
          text: "Your toast was shorter and better. His table disagrees.",
          beers: 3,
          dignity: -5,
          riskDrunk: 1,
        },
      },
    ],
  },
  {
    id: "darts",
    text: "There is a dartboard. It is calling your name.",
    choices: [
      {
        label: "Play a round",
        sub: "Costs $10",
        cost: 10,
        result: {
          text: "Bullseye. Twice. The bar witnessed greatness.",
          dignity: 8,
          chance: 0.5,
          alt: {
            text: "You hit the wall. Then the floor. Then your own foot, nearly.",
            dignity: -5,
            riskDrunk: 1,
          },
        },
      },
      {
        label: "Admire from afar",
        sub: "Wisdom",
        result: {
          text: "Some games are better watched. Especially this one, tonight.",
          dignity: 2,
        },
      },
    ],
  },
  {
    id: "spill",
    text: "Someone spilled a full beer on you.",
    choices: [
      {
        label: "Laugh it off",
        sub: "Grace",
        result: {
          text: "You laugh. The spiller buys you a new one. Grace pays.",
          dignity: 5,
          beers: 1,
        },
      },
      {
        label: "Demand a replacement",
        sub: "Justice",
        result: {
          text: "They bought you two. Justice is sweet and carbonated.",
          beers: 2,
          chance: 0.5,
          alt: {
            text: "They laughed at you. The whole table laughed at you.",
            dignity: -5,
          },
        },
      },
    ],
  },
  {
    id: "surge",
    text: "Uber surge is 4.2x and the crew is checking prices.",
    choices: [
      {
        label: "Close the app",
        sub: "Denial",
        result: {
          text: "Denial is free. The most affordable option tonight.",
          dignity: 3,
        },
      },
      {
        label: "Pre-schedule a ride",
        sub: "Costs $30",
        cost: 30,
        result: {
          text: "Future you says thanks. Present you is $30 poorer.",
          dignity: 10,
        },
      },
    ],
  },
  {
    id: "photobooth",
    text: "Someone found the photo booth.",
    choices: [
      {
        label: "Pile in",
        sub: "Full send",
        result: {
          text: "These photos will surface at the worst possible time. Worth it.",
          dignity: -8,
          beers: 2,
        },
      },
      {
        label: "Hold everyone's drinks",
        sub: "The responsible one",
        result: {
          text: "The responsible one. For now.",
          dignity: 5,
        },
      },
    ],
  },
  {
    id: "djrequest",
    text: "The DJ is taking requests.",
    choices: [
      {
        label: "Request something perfect",
        sub: "Taste",
        result: {
          text: "The DJ nods with respect. The floor fills.",
          dignity: 6,
          beers: 1,
        },
      },
      {
        label: "Request ten minutes of airhorn",
        sub: "Costs $5",
        cost: 5,
        result: {
          text: "The DJ played it. The bar has opinions about you now.",
          dignity: -10,
          beers: 3,
        },
      },
    ],
  },
  {
    id: "oldfriend",
    text: "You spot an old friend across the bar.",
    choices: [
      {
        label: "Go say hi",
        sub: "Reunion",
        result: {
          text: "A genuine reunion. Hugs, stories, a round on them. The night needed this.",
          dignity: 8,
          beers: 2,
        },
      },
      {
        label: "Avoid eye contact",
        sub: "Ghost",
        result: {
          text: "You hid behind a menu. They saw you. Everyone knows.",
          dignity: -3,
        },
      },
    ],
  },
  {
    id: "tequila",
    text: "The crew is doing a round of tequila.",
    choices: [
      {
        label: "Join in",
        sub: "Solidarity",
        result: {
          text: "Salt, lime, regret. In that order.",
          beers: 3,
          dignity: -5,
          riskDrunk: 1,
        },
      },
      {
        label: "Switch to water",
        sub: "The long game",
        result: {
          text: "The crew mocks you, then quietly respects you.",
          dignity: 8,
          soberUp: true,
        },
      },
    ],
  },
  {
    id: "dancefloor",
    text: "The dance floor is filling up.",
    choices: [
      {
        label: "Dance",
        sub: "No fear",
        result: {
          text: "You owned the floor. Someone filmed it. It is magnificent.",
          dignity: 10,
          beers: 2,
          chance: 0.6,
          alt: {
            text: "The worm did not land. It has never landed. It will never land.",
            dignity: -8,
          },
        },
      },
      {
        label: "Hold down the table",
        sub: "Anchor",
        result: {
          text: "Every crew needs an anchor. And a drink holder.",
          dignity: 3,
        },
      },
    ],
  },
  {
    id: "nachos",
    text: "The crew is splitting nachos.",
    choices: [
      {
        label: "Chip in",
        sub: "Costs $12",
        cost: 12,
        result: {
          text: "Cheese: the other great stabilizer.",
          dignity: 10,
        },
      },
      {
        label: "Eat for free",
        sub: "Freeloader",
        result: {
          text: "The crew noticed. The crew always notices.",
          dignity: -8,
        },
      },
    ],
  },
  {
    id: "hotdog",
    text: "A heated debate breaks out: best Chicago hot dog.",
    choices: [
      {
        label: "Defend Portillo's",
        sub: "The classic take",
        result: {
          text: "A solid, defensible position. The table nods.",
          dignity: 4,
        },
      },
      {
        label: "Say the quiet part out loud",
        sub: "Gene's and Jude's",
        result: {
          text: "Silence. Then thunderous agreement. A legendary take.",
          dignity: 8,
          chance: 0.5,
          alt: {
            text: "The table turned on you. A dark day for hot dog discourse.",
            dignity: -5,
          },
        },
      },
    ],
  },
  {
    id: "blackhawk",
    text: "Someone swears they just saw a Blackhawk at the bar.",
    choices: [
      {
        label: "Investigate",
        sub: "It could be real",
        result: {
          text: "It was really him. You played it cool. Mostly.",
          dignity: 15,
          beers: 3,
          chance: 0.3,
          alt: {
            text: "It was a dentist. A very athletic dentist.",
            dignity: -5,
          },
        },
      },
      {
        label: "Stay cool",
        sub: "Unbothered",
        result: {
          text: "Celebrities are people too. You are above this.",
          dignity: 2,
        },
      },
    ],
  },
  {
    id: "rain",
    text: "It started raining outside.",
    choices: [
      {
        label: "Stay put",
        sub: "The bar is the universe",
        result: {
          text: "The bar is the universe now. The rain cannot reach you here.",
          beers: 2,
        },
      },
      {
        label: "Brave the rain",
        sub: "To the next spot",
        result: {
          text: "You arrived soaked and heroic. Mostly soaked.",
          dignity: -5,
          riskDrunk: 1,
        },
      },
    ],
  },
  {
    id: "tab",
    text: "The bartender asks if you want to open a tab.",
    choices: [
      {
        label: "Open it",
        sub: "Live dangerously",
        result: {
          text: "The tab always costs more than you think. But the beers are flowing.",
          beers: 2,
          money: -15,
        },
      },
      {
        label: "Cash only",
        sub: "Fiscal responsibility",
        result: {
          text: "Fiscal responsibility at this hour. Genuinely impressive.",
          dignity: 5,
        },
      },
    ],
  },
  {
    id: "groupchat",
    text: "The group chat is blowing up with people asking where you are.",
    choices: [
      {
        label: "Drop the pin",
        sub: "The more the merrier",
        result: {
          text: "The crew grows. So does the tab.",
          beers: 3,
          dignity: -5,
        },
      },
      {
        label: "Go dark",
        sub: "Mystery",
        result: {
          text: "Mystery is a kind of dignity.",
          dignity: 5,
        },
      },
    ],
  },
  {
    id: "cake",
    text: "It is someone's birthday at the next table. There is cake.",
    choices: [
      {
        label: "Sing along",
        sub: "Join the joy",
        result: {
          text: "You harmonized. Strangers hugged you. Cake is community.",
          dignity: 6,
          beers: 1,
        },
      },
      {
        label: "Steal a slice",
        sub: "Cake heist",
        result: {
          text: "Clean getaway. The frosting was worth the risk.",
          beers: 2,
          chance: 0.5,
          alt: {
            text: "Caught red-handed. The birthday girl is still telling the story.",
            dignity: -8,
          },
        },
      },
    ],
  },
  {
    id: "pool",
    text: "There is a pool table open.",
    choices: [
      {
        label: "Rack 'em",
        sub: "Costs $10",
        cost: 10,
        result: {
          text: "You ran the table. The bar applauds a master.",
          dignity: 10,
          chance: 0.5,
          alt: {
            text: "You scratched on the eight. The silence was total.",
            dignity: -5,
          },
        },
      },
      {
        label: "Too drunk for geometry",
        sub: "Self-awareness",
        result: {
          text: "Self-awareness counts for a lot at this hour.",
          dignity: 2,
        },
      },
    ],
  },
  {
    id: "proposal",
    text: "A stranger is proposing at the bar. Everyone is watching.",
    choices: [
      {
        label: "Cheer",
        sub: "Love wins",
        result: {
          text: "She said yes. The bar erupts. You cried a little.",
          dignity: 6,
        },
      },
      {
        label: "Yell something rude",
        sub: "Why",
        result: {
          text: "Why. Just why.",
          dignity: -15,
        },
      },
    ],
  },
  {
    id: "wifi",
    text: "The bar wifi password is printed on the receipt.",
    choices: [
      {
        label: "Post to the story",
        sub: "Document everything",
        result: {
          text: "Documented for evidence. Future you will review the footage.",
          dignity: -5,
          beers: 2,
        },
      },
      {
        label: "Stay present",
        sub: "Mindfulness",
        result: {
          text: "The night is happening right in front of you. Look at it.",
          dignity: 5,
        },
      },
    ],
  },
  {
    id: "pretzelguy",
    text: "A guy is selling pretzel necklaces for $8. He seems trustworthy.",
    choices: [
      {
        label: "Buy one",
        sub: "Costs $8",
        cost: 8,
        result: {
          text: "A fashion statement and a survival tool. Dignity drain halved for 3 turns.",
          pretzel: 3,
        },
      },
      {
        label: "Hard pass",
        sub: "No necklaces",
        result: {
          text: "Your neck remains unadorned. Your dignity remains undrained, for now.",
        },
      },
    ],
  },
  {
    id: "fortune",
    text: "A fortune teller machine glows in the corner: YOU WILL DRINK EXACTLY 50 BEERS TONIGHT.",
    choices: [
      {
        label: "Believe",
        sub: "Destiny",
        result: {
          text: "The machine knows. The machine has always known.",
          dignity: 5,
        },
      },
      {
        label: "Shake it",
        sub: "Test fate",
        result: {
          text: "Something rattled loose inside. A free beer token. The machine provides.",
          beers: 3,
          chance: 0.5,
          alt: {
            text: "The machine stared back, unmoved. You feel judged by furniture.",
            dignity: -3,
          },
        },
      },
    ],
  },
  {
    id: "speech",
    text: "The crew demands a speech from the leader.",
    choices: [
      {
        label: "Give the speech",
        sub: "Rise to the moment",
        result: {
          text: "A speech for the ages. Someone cried. It might have been you.",
          dignity: 12,
          chance: 0.6,
          alt: {
            text: "You cried during your own speech. The crew will never let it go.",
            dignity: -8,
          },
        },
      },
      {
        label: "Delegate to a crewmate",
        sub: "Share the burden",
        result: {
          text: "Their speech was better than yours would have been. Unforgivable.",
          riskDrunk: 1,
        },
      },
    ],
  },
  {
    id: "cabline",
    text: "The cab line is 40 minutes long.",
    minTurn: 9,
    choices: [
      {
        label: "Wait it out",
        sub: "Patience",
        result: {
          text: "Patience is a virtue you did not know you had.",
          dignity: 5,
        },
      },
      {
        label: "Walk",
        sub: "It is not that far",
        result: {
          text: "It was that far. It was much farther than that.",
          dignity: -5,
          riskDrunk: 1,
        },
      },
    ],
  },
  {
    id: "kincades-story",
    text: "Someone starts telling the 2023 Kincade's story. You were there. You remember it differently.",
    minTurn: 3,
    choices: [
      {
        label: "Correct the record",
        sub: "The truth matters",
        result: {
          text: "Your version checks out. The table concedes.",
          dignity: 8,
          chance: 0.5,
          alt: {
            text: "Your version was somehow worse. The table will not forget.",
            dignity: -5,
          },
        },
      },
      {
        label: "Let them cook",
        sub: "Generosity",
        result: {
          text: "Their version gets better every year. You sip and smile.",
          dignity: 4,
          beers: 1,
        },
      },
    ],
  },
  {
    id: "sluggers-backbar",
    text: "The Sluggers back bar. It smells like 2024 in here.",
    minTurn: 5,
    choices: [
      {
        label: "Order the 2024 order",
        sub: "Muscle memory",
        result: {
          text: "The bartender nods. Some things never change.",
          beers: 2,
          dignity: 3,
        },
      },
      {
        label: "Try something new",
        sub: "Growth",
        result: {
          text: "A new classic is born. The crew approves.",
          dignity: 6,
          chance: 0.5,
          alt: {
            text: "A mistake in a glass. You finish it anyway.",
            dignity: -4,
          },
        },
      },
    ],
  },
  {
    id: "easybar-ghost",
    text: "A cold spot near the back room. The ghost of minimum spends past.",
    minTurn: 7,
    choices: [
      {
        label: "Pay respects",
        sub: "Solemn",
        result: {
          text: "You bow your head. The ghost appreciates the gesture.",
          dignity: 5,
        },
      },
      {
        label: "Taunt the ghost",
        sub: "Audacity",
        result: {
          text: "The ghost respects audacity. The temperature returns to normal.",
          dignity: 10,
          chance: 0.4,
          alt: {
            text: "The ghost does not respect audacity. It gets colder.",
            dignity: -8,
          },
        },
      },
    ],
  },
  {
    id: "fieldhouse-nod",
    text: "The Field House bartender nods at you. She remembers the full buyout.",
    minTurn: 9,
    choices: [
      {
        label: "Nod back",
        sub: "Mutual respect",
        result: {
          text: "Respect recognized. A round appears. You do not ask questions.",
          dignity: 6,
          beers: 2,
        },
      },
      {
        label: "Ask for the usual",
        sub: "Confidence",
        result: {
          text: "She pours it before you finish the sentence. Legendary.",
          beers: 2,
          dignity: 4,
          chance: 0.6,
          alt: {
            text: "She does not remember you at all.",
            dignity: -6,
          },
        },
      },
    ],
  },
  {
    id: "deepdish",
    text: "Someone says deep dish is not pizza.",
    choices: [
      {
        label: "Agree (tavern-style forever)",
        sub: "The correct take",
        result: {
          text: "Tavern-style: crispy, square-cut, perfect. The table agrees.",
          dignity: 5,
        },
      },
      {
        label: "Defend deep dish",
        sub: "Controversial",
        result: {
          text: "A passionate defense. Even the skeptics applaud.",
          dignity: 8,
          chance: 0.5,
          alt: {
            text: "The table turns. A dark day for casserole discourse.",
            dignity: -5,
          },
        },
      },
    ],
  },
  {
    id: "ltrain",
    text: "You hear the L rumble past outside.",
    choices: [
      {
        label: "Wave at the train",
        sub: "Wholesome",
        result: {
          text: "Someone waved back. Probably.",
          dignity: 3,
        },
      },
      {
        label: "Race it to the next stop",
        sub: "Athletic",
        result: {
          text: "The train won. The train always wins.",
          dignity: -5,
          riskDrunk: 1,
        },
      },
    ],
  },
  {
    id: "malort",
    text: "Someone produces a bottle of Malort.",
    choices: [
      {
        label: "Take the shot",
        sub: "Chicago's handshake",
        result: {
          text: "You did not flinch. Everyone saw you flinch a little.",
          beers: 3,
          dignity: -8,
          riskDrunk: 1,
        },
      },
      {
        label: "Pass with honor",
        sub: "Self-preservation",
        result: {
          text: "You kept your dignity. It barely counts, but it counts.",
          dignity: 6,
        },
      },
    ],
  },
  {
    id: "duet",
    text: "The DJ is back. This time it is a duet. He points at your crew.",
    minTurn: 6,
    choices: [
      {
        label: "Take the duet",
        sub: "Harmony",
        result: {
          text: "Flawless harmonies. The bar demands an encore. You decline like pros.",
          dignity: 12,
          beers: 3,
          chance: 0.6,
          alt: {
            text: "You sang different songs. At the same time.",
            dignity: -8,
          },
        },
      },
      {
        label: "Hide",
        sub: "Under the table",
        result: {
          text: "The table is not as big as you remembered.",
          dignity: -3,
        },
      },
    ],
  },
  {
    id: "coatcheck",
    text: "The coat check line is enormous.",
    choices: [
      {
        label: "Wait it out",
        sub: "Patience",
        result: {
          text: "Twenty minutes later, coat in hand. A triumph of persistence.",
          dignity: 2,
        },
      },
      {
        label: "Carry everything",
        sub: "Independence",
        result: {
          text: "You are now wearing three jackets. One is not yours.",
          dignity: -5,
        },
      },
    ],
  },
  {
    id: "atm",
    text: "The ATM charges $4.50.",
    choices: [
      {
        label: "Pay it",
        sub: "Desperate times",
        result: {
          text: "Desperate times call for desperate fees.",
          money: -5,
        },
      },
      {
        label: "Venmo the bartender",
        sub: "Modern solutions",
        result: {
          text: "The bartender accepts. The future is now.",
          dignity: 3,
        },
      },
    ],
  },
  {
    id: "trivia",
    text: "The bar is doing trivia. The category is trees.",
    choices: [
      {
        label: "Join a team",
        sub: "It is Arbor Day, after all",
        result: {
          text: "You knew every answer. The team carries you on their shoulders. Metaphorically.",
          dignity: 10,
          beers: 2,
          chance: 0.6,
          alt: {
            text: "You blanked on 'oak'. OAK.",
            dignity: -4,
          },
        },
      },
      {
        label: "Heckle",
        sub: "From the back",
        result: {
          text: "The trivia host has heard it all before. You are escorted back to your table.",
          dignity: -6,
        },
      },
    ],
  },
  {
    id: "slowsong",
    text: "A slow song comes on.",
    choices: [
      {
        label: "Dance",
        sub: "Sway",
        result: {
          text: "A gentle sway. The night softens for a moment.",
          dignity: 6,
          beers: 1,
        },
      },
      {
        label: "Too crowded",
        sub: "Wallflower",
        result: {
          text: "You watch from the bar. The bar is also nice.",
          dignity: 2,
        },
      },
    ],
  },
  {
    id: "birthday3",
    text: "Another birthday at another table. This is the third tonight.",
    choices: [
      {
        label: "Sing again",
        sub: "Commitment",
        result: {
          text: "You know all the words by now. The birthday table adopts you.",
          dignity: 4,
          beers: 1,
        },
      },
      {
        label: "You have done your part",
        sub: "Rest",
        result: {
          text: "You hum along from your seat. Enough.",
          dignity: 1,
        },
      },
    ],
  },
  {
    id: "nightcap",
    text: "Debate: is a nightcap a good idea?",
    choices: [
      {
        label: "Yes",
        sub: "One more",
        result: {
          text: "One more. Famous last words, deliciously.",
          beers: 2,
          riskDrunk: 1,
        },
      },
      {
        label: "No",
        sub: "Wisdom",
        result: {
          text: "The crew respects the call. Waters all around.",
          dignity: 6,
          soberUp: true,
        },
      },
    ],
  },
  {
    id: "lowbattery",
    text: "Your phone is at 4%.",
    minTurn: 8,
    choices: [
      {
        label: "Find an outlet",
        sub: "The hunt",
        result: {
          text: "You guarded a wall outlet for 20 minutes. It charged to 11%.",
          dignity: -5,
        },
      },
      {
        label: "Airplane mode and pray",
        sub: "Faith",
        result: {
          text: "The phone survives on hope and low power mode.",
          dignity: 3,
        },
      },
    ],
  },
  {
    id: "regular",
    text: "A bar regular tells you about the old days.",
    choices: [
      {
        label: "Listen",
        sub: "Wisdom",
        result: {
          text: "Every bar has a historian. Every historian buys a round.",
          dignity: 5,
          beers: 1,
        },
      },
      {
        label: "One-up him",
        sub: "Bold",
        result: {
          text: "Your story was better. He admits it. The bar applauds.",
          dignity: 8,
          chance: 0.4,
          alt: {
            text: "Your story was not better. The bar is silent.",
            dignity: -8,
          },
        },
      },
    ],
  },
  {
    id: "lasttrain",
    text: "Last train leaves in 20 minutes.",
    minTurn: 10,
    choices: [
      {
        label: "Run for it",
        sub: "Sprint",
        result: {
          text: "You made it with seconds to spare. Athletic excellence.",
          dignity: 8,
          chance: 0.5,
          alt: {
            text: "You watched it pull away. The platform is cold and judgmental.",
            dignity: -5,
            riskDrunk: 1,
          },
        },
      },
      {
        label: "Commit to the night",
        sub: "No regrets",
        result: {
          text: "The night chose you. The night provides.",
          beers: 2,
        },
      },
    ],
  },
  {
    id: "pact",
    text: "The crew makes a pact: same time next year.",
    minTurn: 11,
    choices: [
      {
        label: "Seal it with a shot",
        sub: "Tradition",
        result: {
          text: "A sacred bond, sealed in questionable liquor.",
          beers: 3,
          dignity: 8,
        },
      },
      {
        label: "Just nod",
        sub: "Quiet vow",
        result: {
          text: "A nod says everything. The pact holds.",
          dignity: 4,
        },
      },
    ],
  },
];
