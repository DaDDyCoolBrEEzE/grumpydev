import { Client } from "fnapicom";

const ACCOUNT_TYPES = ["epic", "psn", "xbl"] as const;
const TIME_WINDOWS = ["lifetime", "season"] as const;
const INPUTS = ["all", "keyboardMouse", "gamepad", "touch"] as const;
const MODE_KEYS = ["overall", "solo", "duo", "squad", "ltm"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];
export type TimeWindow = (typeof TIME_WINDOWS)[number];
export type InputMethod = (typeof INPUTS)[number];
export type PlaylistKey = (typeof MODE_KEYS)[number];

export type StatsQuery = {
  username: string;
  accountType: AccountType;
  timeWindow: TimeWindow;
  input: InputMethod;
};

export type PlaylistStats = {
  score: number;
  wins: number;
  kills: number;
  deaths: number;
  kd: number;
  matches: number;
  winRate: number;
  minutesPlayed: number;
  playersOutlived: number;
  top3: number | null;
  top5: number | null;
  top6: number | null;
  top10: number | null;
  top12: number | null;
  top25: number | null;
};

export type PlayerStats = {
  account: {
    id: string;
    name: string;
  };
  battlePass: {
    level: number;
    progress: number;
  };
  image: string | null;
  query: StatsQuery;
  modes: Partial<Record<PlaylistKey, PlaylistStats>>;
};

export class StatsLookupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StatsLookupError";
  }
}

type SearchParams = Record<string, string | string[] | undefined>;

type RawPlaylist = {
  score: number;
  wins: number;
  kills: number;
  deaths: number;
  kd: number;
  matches: number;
  winRate: number;
  minutesPlayed: number;
  playersOutlived: number;
  top3?: number;
  top5?: number;
  top6?: number;
  top10?: number;
  top12?: number;
  top25?: number;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function oneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function parseStatsQuery(searchParams: SearchParams): StatsQuery {
  const username = (firstParam(searchParams.username) ?? "").trim().slice(0, 32);

  return {
    username,
    accountType: oneOf(firstParam(searchParams.accountType), ACCOUNT_TYPES, "epic"),
    timeWindow: oneOf(firstParam(searchParams.timeWindow), TIME_WINDOWS, "lifetime"),
    input: oneOf(firstParam(searchParams.input), INPUTS, "all"),
  };
}

function isFortniteApiError(
  error: unknown,
): error is { name: string; message: string; httpStatus?: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name === "FortniteAPIError"
  );
}

function readPlaylist(raw: RawPlaylist): PlaylistStats {
  return {
    score: raw.score,
    wins: raw.wins,
    kills: raw.kills,
    deaths: raw.deaths,
    kd: raw.kd,
    matches: raw.matches,
    winRate: raw.winRate,
    minutesPlayed: raw.minutesPlayed,
    playersOutlived: raw.playersOutlived,
    top3: raw.top3 ?? null,
    top5: raw.top5 ?? null,
    top6: raw.top6 ?? null,
    top10: raw.top10 ?? null,
    top12: raw.top12 ?? null,
    top25: raw.top25 ?? null,
  };
}

export async function getPlayerStats(query: StatsQuery): Promise<PlayerStats> {
  const apiKey = process.env.FORTNITE_API_KEY;

  if (!apiKey) {
    throw new StatsLookupError("Fortnite API key is not configured.");
  }

  if (!query.username) {
    throw new StatsLookupError("Enter a username.");
  }

  const client = new Client({ apiKey });

  try {
    const response = await client.brStats({
      name: query.username,
      accountType: query.accountType,
      timeWindow: query.timeWindow,
      image: query.input,
    });

    const bucket = response.data.stats[query.input] as
      | Partial<Record<PlaylistKey, RawPlaylist | null>>
      | undefined;
    const modes: PlayerStats["modes"] = {};

    for (const key of MODE_KEYS) {
      const raw = bucket?.[key];
      if (!raw) continue;
      modes[key] = readPlaylist(raw);
    }

    return {
      account: response.data.account,
      battlePass: response.data.battlePass,
      image: response.data.image || null,
      query,
      modes,
    };
  } catch (error) {
    if (error instanceof StatsLookupError) throw error;

    if (isFortniteApiError(error)) {
      if (error.httpStatus === 404) {
        throw new StatsLookupError(`No account found for "${query.username}".`);
      }

      if (error.httpStatus === 401 || error.httpStatus === 403) {
        throw new StatsLookupError("The Fortnite API key was rejected.");
      }

      throw new StatsLookupError(
        error.message || "The Fortnite API request failed.",
      );
    }

    throw new StatsLookupError("Could not load stats. Try again.");
  }
}
