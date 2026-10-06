import Image from "next/image";
import {
  getPlayerStats,
  StatsLookupError,
  type PlayerStats,
  type PlaylistKey,
  type PlaylistStats,
  type StatsQuery,
} from "@/lib/fortnite";

const MODE_LABELS: Record<PlaylistKey, string> = {
  overall: "Overall",
  solo: "Solo",
  duo: "Duos",
  squad: "Squads",
  ltm: "Limited time",
};

const INPUT_LABELS = {
  all: "All platforms",
  keyboardMouse: "Keyboard and mouse",
  gamepad: "Controller",
  touch: "Touch",
} as const;

const ACCOUNT_LABELS = {
  epic: "Epic",
  psn: "PlayStation",
  xbl: "Xbox",
} as const;

const TIME_LABELS = {
  lifetime: "Lifetime",
  season: "This season",
} as const;

const PLACEMENTS: { key: keyof PlaylistStats; label: string }[] = [
  { key: "top3", label: "Top 3" },
  { key: "top5", label: "Top 5" },
  { key: "top6", label: "Top 6" },
  { key: "top10", label: "Top 10" },
  { key: "top12", label: "Top 12" },
  { key: "top25", label: "Top 25" },
];

const integer = new Intl.NumberFormat("en-US");
const decimal = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatPlaytime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours <= 0) return `${remainder}m`;
  return `${integer.format(hours)}h ${remainder}m`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-zinc-50 px-4 py-3 dark:border-white/10 dark:bg-zinc-950">
      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}

function ModeCard({
  label,
  stats,
}: {
  label: string;
  stats: PlaylistStats;
}) {
  const placements = PLACEMENTS.flatMap((placement) => {
    const value = stats[placement.key];
    if (typeof value !== "number") return [];
    return [{ label: placement.label, value }];
  });

  return (
    <section className="rounded-2xl border border-black/8 p-4 dark:border-white/10">
      <h3 className="text-sm font-medium text-zinc-500">{label}</h3>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-zinc-500">Wins</dt>
          <dd className="font-medium tabular-nums">{integer.format(stats.wins)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Matches</dt>
          <dd className="font-medium tabular-nums">
            {integer.format(stats.matches)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Win rate</dt>
          <dd className="font-medium tabular-nums">
            {decimal.format(stats.winRate)}%
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">K/D</dt>
          <dd className="font-medium tabular-nums">{decimal.format(stats.kd)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Kills</dt>
          <dd className="font-medium tabular-nums">
            {integer.format(stats.kills)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Time played</dt>
          <dd className="font-medium tabular-nums">
            {formatPlaytime(stats.minutesPlayed)}
          </dd>
        </div>
      </dl>
      {placements.length > 0 ? (
        <p className="mt-3 text-xs text-zinc-500">
          {placements
            .map((placement) => `${placement.label} ${integer.format(placement.value)}`)
            .join(" · ")}
        </p>
      ) : null}
    </section>
  );
}

function isStatsImage(url: string) {
  try {
    return new URL(url).hostname === "cdn.fortnite-api.com";
  } catch {
    return false;
  }
}

function StatsView({ stats }: { stats: PlayerStats }) {
  const overall = stats.modes.overall;
  const otherModes = (Object.keys(MODE_LABELS) as PlaylistKey[]).filter(
    (key) => key !== "overall" && stats.modes[key],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-zinc-500">
          {ACCOUNT_LABELS[stats.query.accountType]} ·{" "}
          {TIME_LABELS[stats.query.timeWindow]} · {INPUT_LABELS[stats.query.input]}
        </p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">
          {stats.account.name}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Battle pass level {integer.format(stats.battlePass.level)}
          {stats.battlePass.progress > 0
            ? ` · ${integer.format(stats.battlePass.progress)}% to next`
            : ""}
        </p>
      </div>

      {stats.image && isStatsImage(stats.image) ? (
        <Image
          src={stats.image}
          alt={`${stats.account.name} Fortnite stats`}
          width={1280}
          height={720}
          className="h-auto w-full rounded-2xl border border-black/8 dark:border-white/10"
          priority
        />
      ) : null}

      {overall ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Wins" value={integer.format(overall.wins)} />
          <Stat label="K/D" value={decimal.format(overall.kd)} />
          <Stat label="Win rate" value={`${decimal.format(overall.winRate)}%`} />
          <Stat label="Kills" value={integer.format(overall.kills)} />
          <Stat label="Matches" value={integer.format(overall.matches)} />
          <Stat label="Time played" value={formatPlaytime(overall.minutesPlayed)} />
        </div>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400">
          No stats for this input method.
        </p>
      )}

      {otherModes.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {otherModes.map((key) => {
            const mode = stats.modes[key];
            if (!mode) return null;
            return <ModeCard key={key} label={MODE_LABELS[key]} stats={mode} />;
          })}
        </div>
      ) : null}
    </div>
  );
}

export async function StatsResults({ query }: { query: StatsQuery }) {
  let stats: PlayerStats | null = null;
  let message: string | null = null;

  try {
    stats = await getPlayerStats(query);
  } catch (error) {
    message =
      error instanceof StatsLookupError
        ? error.message
        : "Could not load stats. Try again.";
  }

  if (message || !stats) {
    return (
      <p
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
      >
        {message ?? "Could not load stats. Try again."}
      </p>
    );
  }

  return <StatsView stats={stats} />;
}
