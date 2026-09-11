"use client";

import { useState } from "react";
import { services, type Service } from "@/data/company";
import { Card, Check, Section, SectionHeading } from "./primitives";

const groups = [
  "All",
  "Information Technology",
  "Creative & Design",
  "Growth",
] as const;

type Group = (typeof groups)[number];

function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="group flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-bold tracking-tight text-cream-50">
          {service.title}
        </h3>
        <span className="mt-1 rounded-full bg-teal-400/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] whitespace-nowrap text-teal-300/90 uppercase">
          {service.group === "Information Technology"
            ? "IT"
            : service.group === "Creative & Design"
              ? "Design"
              : "Growth"}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-cream-100/60">
        {service.blurb}
      </p>

      <ul className="mt-6 space-y-2.5 border-t border-cream-100/8 pt-5">
        {service.items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm text-cream-100/75"
          >
            <Check className="mt-0.5 text-teal-400" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function Services() {
  const [group, setGroup] = useState<Group>("All");
  const shown =
    group === "All" ? services : services.filter((s) => s.group === group);

  return (
    <Section id="services">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Services"
          title="Everything from the first sketch to the system that runs your business"
          lead="Expertise, thorough knowledge and firsthand experience, paired with industry-specific research, let us analyze, design and implement solutions that work at enterprise scale."
        />

        <div
          role="tablist"
          aria-label="Filter services"
          className="ring-hairline flex flex-wrap gap-1 rounded-full bg-ink-900/60 p-1.5"
        >
          {groups.map((g) => (
            <button
              key={g}
              role="tab"
              aria-selected={group === g}
              onClick={() => setGroup(g)}
              className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
                group === g
                  ? "bg-cream-100 text-ink-950"
                  : "text-cream-100/60 hover:text-cream-50"
              }`}
            >
              {g === "Information Technology" ? "IT" : g}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((s) => (
          <ServiceCard key={s.title} service={s} />
        ))}
      </div>
    </Section>
  );
}
