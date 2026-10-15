"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { logoutAdmin } from "~/app/actions/admin";
import { positions } from "~/lib/tournament";
import { api } from "~/trpc/react";

type Registration = {
  id: number;
  name: string;
  father: string;
  age: number;
  village: string;
  location: string;
  mobile: string;
  position: string;
  payer: string | null;
  trxid: string | null;
  createdAt: Date | string;
};

type ViewMode = "cards" | "table";

const filters = ["All", ...positions];
const viewKey = "barsik-squad-view";

function when(value: Date | string) {
  const shifted = new Date(new Date(value).getTime() + 6 * 60 * 60 * 1000);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  const hour = String(shifted.getUTCHours()).padStart(2, "0");
  const minute = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${day} ${months[shifted.getUTCMonth()]} ${shifted.getUTCFullYear()}, ${hour}:${minute}`;
}

function DeleteControl({
  confirming,
  pending,
  error,
  compact,
  onAsk,
  onCancel,
  onConfirm,
}: {
  confirming: boolean;
  pending: boolean;
  error: string | null;
  compact?: boolean;
  onAsk: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (confirming) {
    return (
      <div className={compact ? "mt-2 grid gap-1" : "mt-3 grid grid-cols-2 gap-2"}>
        <button
          type="button"
          disabled={pending}
          onClick={onConfirm}
          className="h-10 rounded-full bg-flare px-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Delete"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="h-10 rounded-full border border-white/20 px-3 text-sm font-semibold"
        >
          Keep
        </button>
        {error ? <p className="text-sm text-flare">{error}</p> : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAsk}
      className={
        compact
          ? "mt-2 h-9 rounded-full border border-flare/50 px-3 text-xs font-semibold text-flare"
          : "mt-3 h-11 w-full rounded-full border border-flare/50 text-sm font-semibold text-flare"
      }
    >
      Delete
    </button>
  );
}

export function Results({ rows }: { rows: Registration[] }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("All");
  const [view, setView] = useState<ViewMode>("cards");
  const [removed, setRemoved] = useState<number[]>([]);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(viewKey);
    if (saved === "cards" || saved === "table") {
      setView(saved);
      return;
    }
    if (window.matchMedia("(min-width: 1024px)").matches) setView("table");
  }, []);

  function chooseView(next: ViewMode) {
    setView(next);
    window.localStorage.setItem(viewKey, next);
  }

  const remove = api.registration.remove.useMutation({
    onSuccess: (_data, variables) => {
      setRemoved((current) => [...current, variables.id]);
      setConfirming(null);
      setError(null);
      router.refresh();
    },
    onError: (mutationError) => {
      setError(mutationError.message);
    },
  });

  const visible = useMemo(
    () => rows.filter((row) => !removed.includes(row.id)),
    [removed, rows],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return visible.filter((row) => {
      const matchesPosition = position === "All" || row.position === position;
      const haystack =
        `${row.name} ${row.father} ${row.village} ${row.location} ${row.mobile} ${row.trxid ?? ""}`.toLowerCase();
      return matchesPosition && (!needle || haystack.includes(needle));
    });
  }, [position, query, visible]);

  const paid = visible.filter((row) => row.trxid).length;

  function deleteProps(id: number) {
    return {
      confirming: confirming === id,
      pending: remove.isPending && remove.variables?.id === id,
      error: confirming === id ? error : null,
      onAsk: () => {
        setError(null);
        setConfirming(id);
      },
      onCancel: () => setConfirming(null),
      onConfirm: () => remove.mutate({ id }),
    };
  }

  return (
    <div className="night-app min-h-svh overflow-x-clip">
      <header className="px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-amber uppercase">
              Squad sheet
            </p>
            <h1 className="font-display text-3xl font-extrabold">Players</h1>
          </div>
          <form action={logoutAdmin}>
            <button className="h-11 shrink-0 rounded-full border border-white/15 px-4 text-sm font-semibold">
              Log out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-5 pb-10">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Signed up", value: visible.length },
            { label: "With a reference", value: paid },
            { label: "In this view", value: filtered.length },
          ].map((card, index) => (
            <motion.div
              key={card.label}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="turf min-w-0 rounded-2xl p-3 sm:rounded-3xl sm:p-4"
            >
              <p className="text-[11px] leading-tight text-foam/60 sm:text-xs">{card.label}</p>
              <p className="font-display mt-1 text-2xl font-extrabold text-mint sm:text-4xl">
                {card.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="block min-w-0 flex-1">
            <span className="sr-only">Search players</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, village, mobile"
              className="turf h-12 w-full rounded-2xl px-4 text-base text-foam outline-none placeholder:text-foam/40 focus:border-kit sm:h-14"
            />
          </label>
          <div className="turf flex h-12 shrink-0 rounded-full p-1 sm:h-14" role="group" aria-label="Player view">
            {(["cards", "table"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={view === mode}
                onClick={() => chooseView(mode)}
                className={
                  view === mode
                    ? "h-full flex-1 rounded-full bg-amber px-4 text-sm font-bold text-ink sm:px-5"
                    : "h-full flex-1 rounded-full px-4 text-sm font-semibold text-foam sm:px-5"
                }
              >
                {mode === "cards" ? "Cards" : "Table"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setPosition(name)}
              className={
                position === name
                  ? "h-10 rounded-full bg-amber px-3 text-sm font-bold text-ink"
                  : "turf h-10 rounded-full px-3 text-sm font-semibold text-foam"
              }
            >
              {name}
              {name !== "All"
                ? ` ${visible.filter((row) => row.position === name).length}`
                : ""}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-4 rounded-3xl border border-dashed border-white/15 px-4 py-10 text-center text-foam/60">
            No players in this view.
          </p>
        ) : view === "cards" ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {filtered.map((row, index) => (
              <motion.article
                key={row.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 8) * 0.04 }}
                className="turf min-w-0 rounded-3xl p-4 text-foam"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber font-display text-lg font-extrabold text-ink">
                    {row.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold break-words">{row.name}</p>
                      <span className="shrink-0 rounded-full border border-amber/40 px-2 py-1 text-[11px] font-bold text-amber">
                        {row.position}
                      </span>
                    </div>
                    <p className="text-sm text-foam/55">
                      {row.father} · {row.age}
                    </p>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <div className="min-w-0">
                    <dt className="text-xs text-foam/45">Village</dt>
                    <dd className="font-semibold break-words">{row.village}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-foam/45">Lives now</dt>
                    <dd className="font-semibold break-words">{row.location}</dd>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <dt className="text-xs text-foam/45">WhatsApp</dt>
                    <dd>
                      <a className="font-semibold text-mint" href={`tel:${row.mobile}`}>
                        {row.mobile}
                      </a>
                    </dd>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <dt className="text-xs text-foam/45">Contribution</dt>
                    <dd className="font-semibold break-words">
                      {row.trxid
                        ? `${row.trxid}${row.payer ? ` · from ${row.payer}` : ""}`
                        : "None noted"}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-foam/45">{when(row.createdAt)}</p>
                <DeleteControl {...deleteProps(row.id)} />
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="turf mt-4 overflow-hidden rounded-3xl">
            <p className="border-b border-white/10 px-3 py-2 text-xs text-foam/50 lg:hidden">
              Swipe sideways to see every column.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-left text-sm text-foam">
                <thead className="text-[11px] tracking-[0.14em] text-foam/50 uppercase">
                  <tr className="border-b border-white/10">
                    <th className="px-3 py-3">Player</th>
                    <th className="px-3 py-3">Position</th>
                    <th className="px-3 py-3">Village</th>
                    <th className="px-3 py-3">Lives now</th>
                    <th className="px-3 py-3">WhatsApp</th>
                    <th className="px-3 py-3">Reference</th>
                    <th className="px-3 py-3">Signed up</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-b border-white/10 align-top last:border-0">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <p className="font-bold">{row.name}</p>
                        <p className="text-xs text-foam/55">
                          {row.father} · {row.age}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full border border-amber/40 px-2 py-1 text-[11px] font-bold text-amber">
                          {row.position}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold">{row.village}</td>
                      <td className="px-3 py-3 font-semibold">{row.location}</td>
                      <td className="px-3 py-3">
                        <a className="font-semibold text-mint" href={`tel:${row.mobile}`}>
                          {row.mobile}
                        </a>
                        {row.payer ? (
                          <p className="text-xs text-foam/50">Paid from {row.payer}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 font-semibold">{row.trxid ?? "—"}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-foam/70">{when(row.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Link href="/" className="mt-6 block text-center text-sm font-semibold text-amber">
          Back to registration
        </Link>
      </div>
    </div>
  );
}
