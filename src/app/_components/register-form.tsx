"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRef, useState, type InputHTMLAttributes } from "react";

import { positions, tournament } from "~/lib/tournament";
import { api } from "~/trpc/react";

type Draft = {
  name: string;
  father: string;
  age: string;
  village: string;
  location: string;
  mobile: string;
  position: string;
  payer: string;
  trxid: string;
};

const empty: Draft = {
  name: "",
  father: "",
  age: "",
  village: "",
  location: "",
  mobile: "",
  position: "",
  payer: "",
  trxid: "",
};

const steps = [
  "Who is playing?",
  "Where are you from?",
  "How do we reach you?",
  "Optional contribution",
];

function LineField({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-semibold text-foam/70 lg:block lg:text-center">{label}</span>
      <input
        {...props}
        className="mt-1 w-full min-w-0 border-0 border-b-2 border-white/25 bg-transparent py-3 text-lg text-foam outline-none placeholder:text-foam/30 focus:border-amber lg:text-center"
      />
    </label>
  );
}

export function RegisterForm() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(empty);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const allowSubmit = useRef(false);
  const register = api.registration.register.useMutation({
    onSuccess: () => setDone(true),
    onError: (err) => setError(err.message),
  });

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function validate(index: number) {
    if (index === 0) {
      if (draft.name.trim().length < 2) return "Enter the player's full name.";
      if (draft.father.trim().length < 2) return "Enter the father's name.";
    }
    if (index === 1) {
      const age = Number(draft.age);
      if (!draft.village.trim()) return "Enter a village or para.";
      if (!draft.location.trim()) return "Enter the district or city you live in now.";
      if (!Number.isInteger(age) || age < 10 || age > 60) return "Age must be between 10 and 60.";
    }
    if (index === 2) {
      if (!/^(\+?88)?01\d{9}$/.test(draft.mobile.replace(/[\s-]/g, ""))) {
        return "Enter a valid mobile number, for example 01712345678.";
      }
      if (!positions.includes(draft.position as (typeof positions)[number])) {
        return "Choose a playing position.";
      }
    }
    return "";
  }

  function next() {
    const message = validate(step);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function onFormKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    if (!(event.target instanceof HTMLInputElement)) return;
    event.preventDefault();
    if (step < steps.length - 1) {
      next();
      return;
    }
    if (event.target.name === "payer") {
      const transaction = event.currentTarget.elements.namedItem("trxid");
      if (transaction instanceof HTMLInputElement) transaction.focus();
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const intended = allowSubmit.current;
    allowSubmit.current = false;
    if (!intended || step < steps.length - 1) return;

    for (let index = 0; index < 3; index += 1) {
      const message = validate(index);
      if (message) {
        setStep(index);
        setError(message);
        return;
      }
    }
    register.mutate({
      name: draft.name.trim(),
      father: draft.father.trim(),
      age: Number(draft.age),
      village: draft.village.trim(),
      location: draft.location.trim(),
      mobile: draft.mobile.trim(),
      position: draft.position as (typeof positions)[number],
      payer: draft.payer.trim(),
      trxid: draft.trxid.trim(),
      website: (() => {
        const trap = new FormData(event.currentTarget).get("website");
        return typeof trap === "string" ? trap : "";
      })(),
    });
  }

  if (done) {
    return (
      <section className="px-1 py-8 text-foam lg:text-center">
        <p className="text-sm font-semibold tracking-[0.2em] text-mint uppercase">Confirmed</p>
        <h2 className="font-display mt-2 text-4xl font-extrabold">You are in, {draft.name.split(" ")[0]}.</h2>
        <p className="mt-3 text-foam/70 lg:mx-auto lg:max-w-sm">
          We will confirm on WhatsApp. Arrive by {tournament.time} on match day.
        </p>
      </section>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      onKeyDown={onFormKeyDown}
      className="min-w-0 text-foam lg:text-center"
      noValidate
    >
      <div className="flex gap-1.5" aria-hidden>
        {steps.map((title, index) => (
          <span
            key={title}
            className={index <= step ? "h-1 flex-1 rounded-full bg-amber" : "h-1 flex-1 rounded-full bg-white/15"}
          />
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold tracking-[0.18em] text-amber uppercase">
        {step + 1} / {steps.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
          className="mt-2 min-w-0"
        >
          <h2 className="font-display text-[clamp(1.8rem,8vw,2.6rem)] leading-none font-extrabold">
            {steps[step]}
          </h2>

          <div className="mt-6 grid gap-5">
            {step === 0 ? (
              <>
                <LineField
                  label="Full name"
                  name="name"
                  autoComplete="name"
                  value={draft.name}
                  onChange={(event) => set("name", event.target.value)}
                />
                <LineField
                  label="Father's name"
                  name="father"
                  value={draft.father}
                  onChange={(event) => set("father", event.target.value)}
                />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <LineField
                  label="Village / para"
                  name="village"
                  value={draft.village}
                  onChange={(event) => set("village", event.target.value)}
                />
                <LineField
                  label="Where you live now"
                  name="location"
                  value={draft.location}
                  onChange={(event) => set("location", event.target.value)}
                />
                <LineField
                  label="Age"
                  name="age"
                  type="number"
                  inputMode="numeric"
                  min={10}
                  max={60}
                  value={draft.age}
                  onChange={(event) => set("age", event.target.value)}
                />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <LineField
                  label="WhatsApp number"
                  name="mobile"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  value={draft.mobile}
                  onChange={(event) => set("mobile", event.target.value)}
                />
                <fieldset className="min-w-0">
                  <legend className="text-sm font-semibold text-foam/70 lg:mx-auto">Playing position</legend>
                  <div className="mt-3 grid gap-2">
                    {positions.map((position) => {
                      const selected = draft.position === position;
                      return (
                        <button
                          key={position}
                          type="button"
                          onClick={() => set("position", position)}
                          className={
                            selected
                              ? "h-14 w-full rounded-2xl bg-amber text-base font-bold text-ink"
                              : "turf h-14 w-full rounded-2xl text-base font-semibold text-foam"
                          }
                        >
                          {position}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <p className="text-sm leading-relaxed text-foam/70">
                  Pay at least 100 taka by {tournament.payMethod} to{" "}
                  <span className="font-semibold text-foam">{tournament.payNumber}</span> to join,
                  then add the reference.
                </p>
                <LineField
                  label="Number you paid from"
                  name="payer"
                  inputMode="tel"
                  value={draft.payer}
                  onChange={(event) => set("payer", event.target.value)}
                />
                <LineField
                  label="Transaction ID"
                  name="trxid"
                  autoCapitalize="characters"
                  value={draft.trxid}
                  onChange={(event) => set("trxid", event.target.value)}
                />
              </>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none h-0 overflow-hidden" aria-hidden>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="mt-4 min-h-5 text-sm font-semibold text-flare" role="alert">
        {error}
      </p>

      <div className="mt-2 grid gap-3">
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="h-14 w-full rounded-2xl bg-amber text-base font-extrabold text-ink hover:bg-amber/90 transition-colors duration-200 cursor-pointer"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={register.isPending}
            onClick={() => {
              allowSubmit.current = true;
            }}
            className="h-14 w-full rounded-2xl bg-mint text-base font-extrabold text-ink disabled:opacity-60"
          >
            {register.isPending ? "Sending..." : "Submit registration"}
          </button>
        )}
        {step > 0 ? (
          <button
            type="button"
            onClick={() => {
              setError("");
              setStep((current) => current - 1);
            }}
            className="turf h-12 w-full rounded-2xl text-sm font-semibold text-foam"
          >
            Back
          </button>
        ) : null}
      </div>

      <p className="mt-6 text-center text-sm text-foam/50 lg:hidden">Call {tournament.contact}</p>
    </form>
  );
}
