import { useEffect, useState } from "react";
import { heroPrompts, heroStats } from "../data/site";
import { ArrowRight, Button } from "./primitives";

function TypedPlaceholder() {
  const [index, setIndex] = useState(0);
  const [len, setLen] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = heroPrompts[index];
    if (!deleting && len === full.length) {
      const hold = setTimeout(() => setDeleting(true), 2200);
      return () => clearTimeout(hold);
    }
    if (deleting && len === 0) {
      setDeleting(false);
      setIndex((i) => (i + 1) % heroPrompts.length);
      return;
    }
    const tick = setTimeout(
      () => setLen((n) => n + (deleting ? -1 : 1)),
      deleting ? 22 : 46,
    );
    return () => clearTimeout(tick);
  }, [len, deleting, index]);

  return (
    <span aria-hidden="true" className="pointer-events-none">
      {heroPrompts[index].slice(0, len)}
      <span className="ml-0.5 inline-block h-[1.1em] w-px translate-y-[0.18em] bg-teal-300/90" />
    </span>
  );
}

export function Hero({
  brief,
  setBrief,
  onSubmit,
}: {
  brief: string;
  setBrief: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-20 lg:pt-44">
      {/* Ambient ground: dotted mesh plus two soft brand-coloured pools. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="bg-mesh absolute inset-0 opacity-70" />
        <div className="absolute top-[-18rem] left-1/2 size-[46rem] -translate-x-1/2 rounded-full bg-teal-500/12 blur-[130px]" />
        <div className="absolute top-[6rem] right-[-14rem] size-[34rem] rounded-full bg-gold-500/10 blur-[130px]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ink-950" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <a
            href="#engagement"
            className="ring-hairline animate-rise inline-flex items-center gap-2.5 rounded-full bg-ink-900/70 py-1.5 pr-4 pl-1.5 text-sm text-cream-100/80 backdrop-blur transition hover:bg-ink-850"
          >
            <span className="rounded-full bg-teal-400/15 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-teal-300 uppercase">
              Since 2019
            </span>
            Dedicated offshore teams, from 40 hrs / week
            <ArrowRight className="text-cream-100/50" />
          </a>

          <h1
            className="animate-rise mt-8 text-5xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "60ms" }}
          >
            <span className="text-cream-50">Describe the software.</span>
            <br />
            <span className="text-gradient">We bridge it to production.</span>
          </h1>

          <p
            className="animate-rise mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-pretty text-cream-100/65 sm:text-xl"
            style={{ animationDelay: "120ms" }}
          >
            Virtual Bridge Connect is a US-based software development, IT
            services and consultancy firm. Tell us what you need built — we
            scope it, price it competitively, and put a team on it.
          </p>
        </div>

        {/* Brief box — the visitor states the project in their own words. */}
        <form
          id="start"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="animate-rise mx-auto mt-12 max-w-3xl scroll-mt-28"
          style={{ animationDelay: "180ms" }}
        >
          <div className="glow-teal rounded-4xl bg-ink-900/80 p-2 backdrop-blur-xl">
            <div className="rounded-[1.6rem] bg-ink-850/60 p-5 sm:p-6">
              <label
                htmlFor="hero-brief"
                className="mb-3 block text-left font-mono text-[11px] tracking-[0.16em] text-teal-300/90 uppercase"
              >
                Project brief
              </label>

              <div className="relative">
                {brief.length === 0 ? (
                  <div className="pointer-events-none absolute inset-0 px-1 py-1 text-left text-base text-cream-100/35 sm:text-lg">
                    <TypedPlaceholder />
                  </div>
                ) : null}
                <textarea
                  id="hero-brief"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  rows={3}
                  placeholder=" "
                  className="w-full resize-none bg-transparent px-1 py-1 text-left text-base text-cream-50 outline-none placeholder:text-transparent sm:text-lg"
                />
              </div>

              <div className="mt-5 flex flex-col gap-4 border-t border-cream-100/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-left text-xs text-cream-100/45">
                  No obligation. We reply with scope, model and a price.
                </p>
                <Button type="submit" className="w-full sm:w-auto">
                  Get a proposal
                  <ArrowRight />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {heroPrompts.slice(0, 4).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setBrief(p)}
                className="ring-hairline rounded-full bg-ink-900/50 px-4 py-2 text-xs text-cream-100/60 transition hover:bg-ink-850 hover:text-cream-50"
              >
                {p}
              </button>
            ))}
          </div>
        </form>

        <dl
          className="animate-rise mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4"
          style={{ animationDelay: "240ms" }}
        >
          {heroStats.map((s) => (
            <div key={s.label} className="text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block text-4xl font-extrabold tracking-tight text-cream-50">
                  {s.value}
                </span>
                <span className="mt-2 block text-sm text-cream-100/50">
                  {s.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
