"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { tournament } from "~/lib/tournament";

function Ball({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <circle cx="40" cy="40" r="36" fill="#f4f7f1" stroke="#102818" strokeWidth="3" />
      <polygon points="40,18 50,30 46,44 34,44 30,30" fill="#102818" />
      <polygon points="18,34 28,30 22,18 12,24" fill="#102818" />
      <polygon points="62,34 68,24 58,18 52,30" fill="#102818" />
      <polygon points="16,52 26,46 22,58 12,58" fill="#102818" />
      <polygon points="64,52 68,58 58,58 54,46" fill="#102818" />
      <polygon points="40,62 50,54 46,66 34,66 30,54" fill="#102818" />
    </svg>
  );
}

function Icon({ name }: { name: "date" | "time" | "place" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "date") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <rect x="4" y="5" width="16" height="15" rx="2" {...common} />
        <path d="M8 3.5v3M16 3.5v3M4 10h16" {...common} />
      </svg>
    );
  }
  if (name === "time") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <circle cx="12" cy="12" r="8" {...common} />
        <path d="M12 8v4.5l3 2" {...common} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" {...common} />
      <circle cx="12" cy="11" r="1.6" fill="currentColor" />
    </svg>
  );
}

const facts = [
  { icon: "date" as const, label: "Match day", value: tournament.date },
  { icon: "time" as const, label: "Kickoff", value: tournament.time },
  { icon: "place" as const, label: "Ground", value: tournament.place },
];

export function MatchPoster() {
  const reduce = useReducedMotion();

  return (
    <header className="relative min-w-0 overflow-hidden px-5 pt-[max(1.1rem,env(safe-area-inset-top))] pb-8 lg:sticky lg:top-0 lg:flex lg:min-h-svh lg:flex-col lg:justify-between lg:px-10 lg:py-10">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-8 -left-16 h-40 w-40 rounded-full border-2 border-white/20" />
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-bl-[4.5rem] bg-[#8FCB3A]" />
        <div className="absolute top-20 right-5 h-16 w-16 rounded-full border-[5px] border-white/85" />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-3">
        <p className="font-display text-sm font-extrabold tracking-[0.28em] text-kit uppercase">
          DEBIPUR FC
        </p>
        <Link
          href="/dashboard"
          className="rounded-full border border-white/30 bg-[#082216]/70 px-3 py-2 text-xs font-semibold text-white"
        >
          Organizer
        </Link>
      </div>

      <motion.div
        className="relative z-10 mt-5 lg:mt-8"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="font-display text-xs font-bold tracking-[0.35em] text-white/80 uppercase">
          Annual village cup
        </p>
        <h1 className="font-display mt-2 text-[clamp(2.7rem,12vw,6.4rem)] leading-[0.82] font-extrabold tracking-[-0.04em] text-white uppercase">
          <span className="block text-kit">Football</span>
          <span className="relative mt-1 block pr-14 sm:pr-16">
            Match
            <Ball className="absolute top-1/2 right-0 h-12 w-12 -translate-y-1/2 drop-shadow-lg sm:h-20 sm:w-20" />
          </span>
        </h1>
        <p className="mt-3 max-w-[18ch] text-xl leading-tight font-bold text-white lg:mt-4 lg:text-2xl">
          বার্ষিক ফুটবল টুর্নামেন্ট
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80 lg:mt-3">
          Students, job holders, and anyone living away from the village can play.
          Entry closes {tournament.deadline}.
        </p>
      </motion.div>

      <div className="relative z-10 mt-5 grid grid-cols-3 gap-2 lg:mt-7 lg:grid-cols-1 lg:gap-3">
        {facts.map((fact, index) => (
          <motion.div
            key={fact.label}
            initial={reduce ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * index }}
            className="flex min-w-0 flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-3"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-ink lg:h-11 lg:w-11">
              <Icon name={fact.icon} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.12em] text-kit uppercase lg:text-[11px] lg:tracking-[0.16em]">{fact.label}</p>
              <p className="text-xs leading-tight font-bold break-words text-white lg:truncate lg:text-base">{fact.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </header>
  );
}
