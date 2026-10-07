// Pure game logic for The Arbor Day Trail. No UI here, only state in, state out.

import {
  ACHIEVEMENTS,
  ChoiceResult,
  CLASSES,
  ClassId,
  CrewMember,
  DEFAULT_NAMES,
  EVENTS,
  GOAL_BEERS,
  LANDMARKS,
  Landmark,
  MemberStatus,
  PaceId,
  PACES,
  RationId,
  RATIONS,
  SHOP_ITEMS,
  TOASTS,
  TOMBSTONE_CAUSES,
  TrailEvent,
} from "./data";

export type Screen =
  | "title"
  | "setup"
  | "travel"
  | "event"
  | "landmark"
  | "shop"
  | "pong"
  | "roulette"
  | "over";

export interface Tombstone {
  name: string;
  cause: string;
}

export interface GameState {
  screen: Screen;
  turn: number;
  crew: CrewMember[];
  classId: ClassId;
  paceId: PaceId;
  rationId: RationId;
  beers: number;
  money: number;
  dignity: number;
  log: string[];
  event: TrailEvent | null;
  eventResult: string | null;
  landmark: Landmark | null;
  landmarkResult: string | null;
  pongThrowsLeft: number;
  pongHits: number;
  pongUsed: boolean;
  rouletteBad: number;
  rouletteTaken: number[];
  rouletteUsed: boolean;
  rouletteResult: string | null;
  pretzelTurns: number;
  over: boolean;
  won: boolean;
  endReason: string;
  tombstones: Tombstone[];
  score: number;
}

export interface SetupInput {
  names: string[];
  classId: ClassId;
  paceId: PaceId;
  rationId: RationId;
}

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(arr: T[]): T => arr[rand(arr.length)];

export function formatClock(turn: number): string {
  const total = 21 * 60 + turn * 15;
  const h24 = Math.floor(total / 60) % 24;
  const m = total % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export function getClass(id: ClassId) {
  return CLASSES.find((c) => c.id === id) ?? CLASSES[0];
}
export function getPace(id: PaceId) {
  return PACES.find((p) => p.id === id) ?? PACES[1];
}
export function getRation(id: RationId) {
  return RATIONS.find((r) => r.id === id) ?? RATIONS[1];
}

function pushLog(log: string[], line: string): string[] {
  return [...log.slice(-40), line];
}

export function createGame(input: SetupInput): GameState {
  const cls = getClass(input.classId);
  const names = input.names.map((n, i) =>
    n.trim() === "" ? DEFAULT_NAMES[i] ?? `Friend ${i + 1}` : n.trim().slice(0, 16)
  );
  const crew: CrewMember[] = names.map((name) => ({
    name,
    tolerance: cls.tolerance + rand(3),
    charm: 4 + rand(5),
    status: "sober" as MemberStatus,
  }));
  return {
    screen: "travel",
    turn: 0,
    crew,
    classId: input.classId,
    paceId: input.paceId,
    rationId: input.rationId,
    beers: 0,
    money: cls.money,
    dignity: 100,
    log: [
      `9:00 PM. The crew assembles: ${names.join(", ")}.`,
      `Goal: ${GOAL_BEERS} beers by midnight. The trail awaits.`,
    ],
    event: null,
    eventResult: null,
    landmark: LANDMARKS[0],
    landmarkResult: null,
    pongThrowsLeft: 0,
    pongHits: 0,
    pongUsed: false,
    rouletteBad: 0,
    rouletteTaken: [],
    rouletteUsed: false,
    rouletteResult: null,
    pretzelTurns: 0,
    over: false,
    won: false,
    endReason: "",
    tombstones: [],
    score: 0,
  };
}

function standingCrew(state: GameState): CrewMember[] {
  return state.crew.filter((m) => m.status !== "gone");
}

function wobbleMember(state: GameState, member: CrewMember): GameState {
  const order: MemberStatus[] = ["sober", "tipsy", "drunk", "gone"];
  const idx = order.indexOf(member.status);
  if (idx >= order.length - 1) return state;
  const roll = rand(10) + 1;
  if (roll <= member.tolerance) return state;
  const next = order[idx + 1];
  const crew = state.crew.map((m) =>
    m === member ? { ...m, status: next } : m
  );
  let log = state.log;
  let tombstones = state.tombstones;
  if (next === "gone") {
    const cause = pick(TOMBSTONE_CAUSES);
    tombstones = [...tombstones, { name: member.name, cause }];
    log = pushLog(log, `${member.name} is gone. Cause: ${cause}.`);
  } else {
    log = pushLog(log, `${member.name} is now ${next}.`);
  }
  return { ...state, crew, log, tombstones };
}

function soberMember(state: GameState): GameState {
  const order: MemberStatus[] = ["sober", "tipsy", "drunk"];
  const candidates = state.crew.filter(
    (m) => m.status === "tipsy" || m.status === "drunk"
  );
  if (candidates.length === 0) return state;
  const member = pick(candidates);
  const idx = order.indexOf(member.status);
  const next = order[Math.max(0, idx - 1)];
  const crew = state.crew.map((m) =>
    m === member ? { ...m, status: next } : m
  );
  return {
    ...state,
    crew,
    log: pushLog(state.log, `${member.name} sobers up a level (${next}).`),
  };
}

function randomStanding(state: GameState): CrewMember | null {
  const s = standingCrew(state);
  return s.length === 0 ? null : pick(s);
}

function applyResult(state: GameState, r: ChoiceResult): GameState {
  let next: GameState = { ...state };
  let text = r.text;
  if (r.chance !== undefined && r.alt) {
    if (Math.random() > r.chance) {
      return applyResult(state, r.alt);
    }
  }
  if (r.beers) {
    next = { ...next, beers: Math.max(0, next.beers + r.beers) };
  }
  if (r.money) {
    next = { ...next, money: Math.max(0, next.money + r.money) };
  }
  if (r.dignity) {
    next = { ...next, dignity: Math.max(0, Math.min(100, next.dignity + r.dignity)) };
  }
  if (r.pretzel) {
    next = { ...next, pretzelTurns: next.pretzelTurns + r.pretzel };
    text += " Pretzel necklace equipped.";
  }
  if (r.soberUp) {
    next = soberMember(next);
  }
  if (r.riskDrunk) {
    for (let i = 0; i < r.riskDrunk; i++) {
      const m = randomStanding(next);
      if (m) next = wobbleMember(next, m);
    }
  }
  next = { ...next, log: pushLog(next.log, text) };
  return checkEnd(next);
}

function checkEnd(state: GameState): GameState {
  if (state.over) return state;
  const gone = state.crew.filter((m) => m.status === "gone");
  const leader = state.crew[0];
  if (leader && leader.status === "gone") {
    return endGame(state, false, "The leader has fallen. Without a leader, the trail ends here.");
  }
  if (gone.length >= 3) {
    return endGame(state, false, "Three crew members are gone. The trail claims another party.");
  }
  if (state.dignity <= 0) {
    return endGame(state, false, "The crew's dignity has reached zero. You are now a story told at future parties.");
  }
  return state;
}

function endGame(state: GameState, won: boolean, reason: string): GameState {
  const cls = getClass(state.classId);
  const standing = standingCrew(state).length;
  const score = Math.max(
    0,
    Math.round(
      state.beers * 10 * cls.multiplier + state.dignity * 2 + state.money + standing * 150
    )
  );
  return { ...state, over: true, won, endReason: reason, score };
}

function rollEvent(state: GameState): GameState {
  const pace = getPace(state.paceId);
  if (Math.random() > pace.eventChance) return { ...state, screen: "travel" };
  const pool = EVENTS.filter(
    (e) => (e.minTurn ?? 0) <= state.turn && state.event?.id !== e.id
  );
  if (pool.length === 0) return { ...state, screen: "travel" };
  const event = pick(pool);
  return { ...state, screen: "event", event, eventResult: null };
}

export function advanceTurn(state: GameState, rest: boolean): GameState {
  const pace = getPace(state.paceId);
  const ration = getRation(state.rationId);
  let next: GameState = {
    ...state,
    turn: state.turn + 1,
    event: null,
    eventResult: null,
    landmark: null,
    landmarkResult: null,
    pongUsed: false,
    rouletteUsed: false,
    rouletteResult: null,
  };

  if (rest) {
    const order: MemberStatus[] = ["sober", "tipsy", "drunk"];
    const crew = next.crew.map((m) => {
      const idx = order.indexOf(m.status);
      if (idx <= 0) return m;
      return { ...m, status: order[idx - 1] };
    });
    next = {
      ...next,
      crew,
      dignity: Math.min(100, next.dignity + 10),
      log: pushLog(next.log, "The crew rests. Waters all around. Dignity slowly returns."),
    };
  } else {
    const drain = next.pretzelTurns > 0 ? Math.ceil(pace.dignityDrain / 2) : pace.dignityDrain;
    next = {
      ...next,
      beers: next.beers + pace.beersPerTurn + ration.beerMod,
      money: Math.max(0, next.money - ration.costPerTurn),
      dignity: Math.max(0, next.dignity - drain + ration.dignityMod),
      pretzelTurns: Math.max(0, next.pretzelTurns - 1),
      log: pushLog(
        next.log,
        `${formatClock(next.turn)}: +${pace.beersPerTurn + ration.beerMod} beers (-$${ration.costPerTurn}).`
      ),
    };
    if (next.money <= 0 && next.rationId !== "nursing") {
      next = {
        ...next,
        rationId: "nursing",
        log: pushLog(next.log, "The crew is broke. Rations drop to nursing one beer."),
      };
    }
    for (const m of standingCrew(next)) {
      if (Math.random() < pace.wobbleChance) {
        next = wobbleMember(next, m);
      }
    }
  }

  next = checkEnd(next);
  if (next.over) return { ...next, screen: "over" };

  const landmark = LANDMARKS.find((l) => l.turn === next.turn);
  if (landmark) {
    if (landmark.final) {
      const won = next.beers >= GOAL_BEERS;
      const reason = won
        ? `Midnight. ${next.beers} beers. The crew stands (mostly). The trail is conquered.`
        : `Midnight arrived with only ${next.beers} beers. The trail demanded ${GOAL_BEERS}.`;
      return {
        ...endGame(next, won, reason),
        screen: "landmark",
        landmark,
      };
    }
    return {
      ...next,
      screen: "landmark",
      landmark,
      log: pushLog(next.log, `Arrived: ${landmark.name} (${landmark.year}). ${landmark.blurb}`),
    };
  }

  return rollEvent(next);
}

export function resolveChoice(state: GameState, choiceIndex: number): GameState {
  if (!state.event) return state;
  const choice = state.event.choices[choiceIndex];
  if (!choice) return state;
  if (choice.cost && state.money < choice.cost) return state;
  let next: GameState = { ...state };
  if (choice.cost) {
    next = { ...next, money: next.money - choice.cost };
  }
  next = applyResult(next, choice.result);
  return { ...next, eventResult: choice.result.text, screen: "event" };
}

export function leaveLandmark(state: GameState): GameState {
  if (state.over) return { ...state, screen: "over" };
  return { ...state, screen: "travel", landmark: null, landmarkResult: null };
}

export function giveToast(state: GameState, toastIndex: number): GameState {
  const toast = TOASTS[toastIndex];
  if (!toast) return state;
  const success = Math.random() < 0.7;
  let next: GameState = { ...state };
  if (success) {
    next = {
      ...next,
      dignity: Math.min(100, next.dignity + 8),
      beers: next.beers + 2,
      landmarkResult: toast.success,
      log: pushLog(next.log, `Toast: "${toast.text}" ${toast.success}`),
    };
  } else {
    next = {
      ...next,
      dignity: Math.max(0, next.dignity - 5),
      landmarkResult: toast.fail,
      log: pushLog(next.log, `Toast: "${toast.text}" ${toast.fail}`),
    };
  }
  next = checkEnd(next);
  if (next.over) return { ...next, screen: "over" };
  return next;
}

export function startPong(state: GameState): GameState {
  return { ...state, screen: "pong", pongThrowsLeft: 3, pongHits: 0 };
}

export function throwPong(state: GameState, hit: boolean): GameState {
  const hits = state.pongHits + (hit ? 1 : 0);
  const left = state.pongThrowsLeft - 1;
  const beers = state.beers + (hit ? 2 : 0);
  const log = hit
    ? pushLog(state.log, "Beer pong: splash. +2 beers.")
    : pushLog(state.log, "Beer pong: rim out. The table groans.");
  if (left <= 0) {
    return {
      ...state,
      beers,
      pongHits: hits,
      pongThrowsLeft: 0,
      pongUsed: true,
      screen: "landmark",
      log,
    };
  }
  return { ...state, beers, pongHits: hits, pongThrowsLeft: left, log };
}

export function buyItem(state: GameState, itemId: string): GameState {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item || state.money < item.cost) return state;
  let next: GameState = { ...state, money: state.money - item.cost };
  next = { ...next, log: pushLog(next.log, `Bought: ${item.name} (-$${item.cost}).`) };
  if (item.id === "water") {
    next = soberMember(next);
    next = { ...next, dignity: Math.min(100, next.dignity + 5) };
  } else if (item.id === "pretzel") {
    next = { ...next, pretzelTurns: next.pretzelTurns + 3 };
  } else if (item.id === "mystery") {
    next = { ...next, beers: next.beers + 3 };
    const m = randomStanding(next);
    if (m) next = wobbleMember(next, m);
  } else if (item.id === "burrito") {
    next = { ...next, dignity: Math.min(100, next.dignity + 15) };
  }
  next = checkEnd(next);
  if (next.over) return { ...next, screen: "over" };
  return next;
}

export function shopItemsForTurn(turn: number) {
  return SHOP_ITEMS.filter((i) => (i.minTurn ?? 0) <= turn);
}

/* ---------------- shot roulette ---------------- */

export function startRoulette(state: GameState): GameState {
  return {
    ...state,
    screen: "roulette",
    rouletteBad: rand(6),
    rouletteTaken: [],
    rouletteResult: null,
  };
}

export function takeRouletteShot(state: GameState, slot: number): GameState {
  if (state.rouletteTaken.includes(slot)) return state;
  const taken = [...state.rouletteTaken, slot];
  if (slot === state.rouletteBad) {
    let next: GameState = {
      ...state,
      rouletteTaken: taken,
      rouletteUsed: true,
      dignity: Math.max(0, state.dignity - 5),
      rouletteResult: "THE BAD ONE. The room tilts sideways.",
      log: pushLog(state.log, "Shot roulette: THE BAD ONE. The room tilts sideways."),
    };
    const m = randomStanding(next);
    if (m) next = wobbleMember(next, m);
    next = checkEnd(next);
    if (next.over) return { ...next, screen: "over" };
    return { ...next, screen: "roulette" };
  }
  const good = taken.length;
  let next: GameState = {
    ...state,
    rouletteTaken: taken,
    beers: state.beers + 2,
    log: pushLog(state.log, `Shot roulette: clean. +2 beers (${good}/5).`),
  };
  if (good >= 5) {
    next = {
      ...next,
      rouletteUsed: true,
      dignity: Math.min(100, next.dignity + 5),
      rouletteResult: "All five clean. Daredevil. +5 dignity.",
      log: pushLog(next.log, "Shot roulette: all five clean. Daredevil."),
    };
  }
  return next;
}

export function leaveRoulette(state: GameState): GameState {
  if (state.over) return { ...state, screen: "over" };
  return { ...state, screen: "landmark", rouletteResult: null };
}

/* ---------------- achievements ---------------- */

const ACH_KEY = "arbor-trail-achievements";

export function loadAchievements(): string[] {
  try {
    const raw = localStorage.getItem(ACH_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Achievement ids earned by this finished run. */
export function evaluateAchievements(state: GameState): string[] {
  const ids: string[] = [];
  if (!state.over) return ids;
  if (state.won) {
    ids.push("conqueror");
    if (state.paceId === "sending") ids.push("sending-survivor");
    if (state.tombstones.length === 0) ids.push("untouchable");
    if (state.classId === "rookie") ids.push("rookie-year");
    if (state.beers === GOAL_BEERS) ids.push("exact-50");
    if (state.money >= 100) ids.push("high-roller");
    if (state.dignity >= 90) ids.push("dignified");
    if (state.dignity < 25) ids.push("fumes");
  }
  return ids.filter((id) => ACHIEVEMENTS.some((a) => a.id === id));
}

/** Merge newly earned ids into storage. Returns ids that are new this run. */
export function unlockAchievements(ids: string[]): string[] {
  const prev = loadAchievements();
  const fresh = ids.filter((id) => !prev.includes(id));
  if (fresh.length > 0) {
    try {
      localStorage.setItem(ACH_KEY, JSON.stringify([...prev, ...fresh]));
    } catch {
      // ignore
    }
  }
  return fresh;
}

export interface HighScore {
  name: string;
  score: number;
  beers: number;
  className: string;
  won: boolean;
  date: string;
}

const SCORE_KEY = "arbor-trail-scores";

export function loadScores(): HighScore[] {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScore(entry: HighScore): HighScore[] {
  const scores = [...loadScores(), entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
  try {
    localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
  } catch {
    // storage unavailable, ignore
  }
  return scores;
}
