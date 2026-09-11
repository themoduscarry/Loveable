"use client";

import { useState } from "react";
import { expertise, industries, platforms } from "@/data/company";
import { Section, SectionHeading } from "./primitives";

export function Expertise() {
  const [active, setActive] = useState(0);
  const current = expertise[active];

  return (
    <Section id="expertise" className="border-t border-cream-100/8">
      <SectionHeading
        eyebrow="Expertise"
        title="Eight practice areas, one accountable team"
        lead="Highly skilled personnel with substantial experience across information technology. Pick an area to see what sits inside it."
      />

      <div className="mt-14 grid gap-4 lg:grid-cols-[minmax(0,20rem)_1fr]">
        {/* Area selector */}
        <ul
          role="tablist"
          aria-label="Expertise areas"
          aria-orientation="vertical"
          className="ring-hairline flex gap-1 overflow-x-auto rounded-3xl bg-ink-900/50 p-2 lg:flex-col lg:overflow-visible"
        >
          {expertise.map((area, i) => (
            <li key={area.area} className="lg:w-full">
              <button
                role="tab"
                aria-selected={active === i}
                onClick={() => setActive(i)}
                className={`flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold whitespace-nowrap transition ${
                  active === i
                    ? "bg-cream-100 text-ink-950"
                    : "text-cream-100/65 hover:bg-cream-100/6 hover:text-cream-50"
                }`}
              >
                {area.area}
                <span
                  className={`font-mono text-[10px] ${
                    active === i ? "text-ink-950/50" : "text-cream-100/30"
                  }`}
                >
                  {String(area.skills.length).padStart(2, "0")}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Skills panel */}
        <div
          role="tabpanel"
          aria-label={current.area}
          className="ring-hairline rounded-3xl bg-gradient-to-br from-ink-900/80 to-ink-850/40 p-8 sm:p-10"
        >
          <h3 className="text-3xl font-extrabold tracking-tight text-cream-50">
            {current.area}
          </h3>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {current.skills.map((skill, i) => (
              <div
                key={skill}
                className="animate-rise ring-hairline flex items-center gap-3 rounded-2xl bg-ink-950/40 px-4 py-3.5"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="font-mono text-[10px] text-teal-300/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-cream-100/80">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform strip */}
      <div className="mt-14">
        <p className="font-mono text-[11px] tracking-[0.18em] text-cream-100/40 uppercase">
          Platforms & technologies
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {platforms.map((p) => (
            <li
              key={p}
              className="ring-hairline rounded-full bg-ink-900/50 px-3.5 py-1.5 font-mono text-xs text-cream-100/60"
            >
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Industries served */}
      <div className="mt-14 rounded-3xl border border-cream-100/8 bg-ink-900/30 p-8 sm:p-10">
        <h3 className="text-xl font-bold tracking-tight text-cream-50">
          Tailor-built enterprise frameworks, implemented in
        </h3>
        <p className="mt-2 max-w-2xl text-sm text-cream-100/55">
          Successful implementations for mid-size to large concerns across
          process manufacturing, retail and distribution.
        </p>
        <ul className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((ind) => (
            <li key={ind.sector} className="border-t border-cream-100/10 pt-4">
              <p className="text-base font-semibold text-cream-50">
                {ind.sector}
              </p>
              <p className="mt-1 text-xs text-cream-100/45">{ind.kind}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
