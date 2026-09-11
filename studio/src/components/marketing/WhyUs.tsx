import { reasons, valueProposition } from "@/data/company";
import { Check, Section, SectionHeading } from "./primitives";

export function WhyUs() {
  return (
    <Section id="why-us" className="border-t border-cream-100/8">
      <SectionHeading
        eyebrow="Why us"
        title="Six reasons clients stay past the first project"
        lead="Our focused, sound and innovative approach comes from the cumulative experience of our team — practical business experience combined with strong technology delivery."
      />

      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {reasons.map((r, i) => (
          <article
            key={r.title}
            className="ring-hairline group relative overflow-hidden rounded-3xl bg-ink-900/50 p-8 transition duration-300 hover:bg-ink-850/70"
          >
            <span
              aria-hidden="true"
              className="absolute -top-6 -right-2 font-mono text-7xl font-bold text-cream-100/4 transition group-hover:text-teal-300/8"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="relative text-lg font-bold tracking-tight text-cream-50">
              {r.title}
            </h3>
            <p className="relative mt-4 text-sm leading-relaxed text-cream-100/60">
              {r.body}
            </p>
          </article>
        ))}
      </div>

      {/* Offshore value proposition */}
      <div className="mt-16 grid gap-10 rounded-4xl border border-cream-100/8 bg-gradient-to-br from-ink-900/70 via-ink-900/40 to-transparent p-8 sm:p-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h3 className="text-3xl font-extrabold tracking-tight text-balance text-cream-50">
            Offshore outsourcing, without giving up control
          </h3>
          <p className="mt-5 text-base leading-relaxed text-cream-100/60">
            Outsourced development is a cost-effective alternative to building
            in-house. We safeguard your intellectual property, proprietary
            software and development specifications, and depending on the
            engagement model you retain full ownership of all IP at the
            completion of the project.
          </p>
          <p className="mt-4 text-base leading-relaxed text-cream-100/60">
            Every step in the project life cycle is clearly defined and
            documented — that is what makes a distributed team feel like one
            team.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:content-start">
          {valueProposition.map((v) => (
            <li
              key={v}
              className="flex items-start gap-3 rounded-2xl bg-ink-950/40 px-4 py-3.5 text-sm text-cream-100/75"
            >
              <Check className="mt-0.5 text-teal-400" />
              {v}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
