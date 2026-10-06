import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { parseStatsQuery, type StatsQuery } from "@/lib/fortnite";
import { StatsResults } from "./stats-results";
import { SubmitButton } from "./submit-button";

export const metadata = {
  title: "Fortnite stats",
  description: "Look up Fortnite Battle Royale stats by username.",
};

const selectClassName =
  "h-11 rounded-xl border border-black/10 bg-transparent px-3 text-sm dark:border-white/15";

function queryKey(query: StatsQuery) {
  return `${query.username}|${query.accountType}|${query.timeWindow}|${query.input}`;
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseStatsQuery(await searchParams);

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-4xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
          >
            Home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            Fortnite stats
          </h1>
          <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
            Enter an Epic, PlayStation, or Xbox username to load Battle Royale
            stats.
          </p>
        </div>

        <Form
          key={`form-${queryKey(query)}`}
          action="/stats"
          className="flex flex-col gap-4 rounded-3xl border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-zinc-950 sm:p-5"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              name="username"
              defaultValue={query.username}
              required
              maxLength={32}
              placeholder="SatchM03_CB"
              autoComplete="off"
              className="h-11 rounded-xl border border-black/10 bg-transparent px-3 text-base outline-none focus:border-zinc-400 dark:border-white/15 dark:focus:border-zinc-500"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="accountType" className="text-sm font-medium">
                Account
              </label>
              <select
                id="accountType"
                name="accountType"
                defaultValue={query.accountType}
                className={selectClassName}
              >
                <option value="epic">Epic</option>
                <option value="psn">PlayStation</option>
                <option value="xbl">Xbox</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="timeWindow" className="text-sm font-medium">
                Time window
              </label>
              <select
                id="timeWindow"
                name="timeWindow"
                defaultValue={query.timeWindow}
                className={selectClassName}
              >
                <option value="lifetime">Lifetime</option>
                <option value="season">This season</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="input" className="text-sm font-medium">
                Input
              </label>
              <select
                id="input"
                name="input"
                defaultValue={query.input}
                className={selectClassName}
              >
                <option value="all">All platforms</option>
                <option value="keyboardMouse">Keyboard and mouse</option>
                <option value="gamepad">Controller</option>
                <option value="touch">Touch</option>
              </select>
            </div>
          </div>

          <div>
            <SubmitButton />
          </div>
        </Form>

        {query.username ? (
          <Suspense
            key={`results-${queryKey(query)}`}
            fallback={
              <p className="text-sm text-zinc-500">
                Looking up {query.username}…
              </p>
            }
          >
            <StatsResults query={query} />
          </Suspense>
        ) : (
          <p className="text-sm text-zinc-500">
            Stats show up here after you look up a player.
          </p>
        )}
      </main>
    </div>
  );
}
