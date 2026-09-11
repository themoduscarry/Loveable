import { process } from "@/data/company";
import { Section, SectionHeading } from "./primitives";

export function Process() {
  return (
    <Section id="process" className="border-t border-cream-100/8">
      <SectionHeading
        eyebrow="Our approach"
        title="A roadmap of eight steps, each with its own significance"
        lead="We invest the time up front to understand your needs, then manage the project so it lands on time and within budget — and so you always know where it stands."
        align="center"
      />

      <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-cream-100/8 sm:grid-cols-2 lg:grid-cols-4">
        {process.map((p, i) => (
          <li
            key={p.step}
            className="group relative bg-ink-950 p-7 transition duration-300 hover:bg-ink-900"
          >
            <span
              aria-hidden="true"
              className="font-mono text-sm text-teal-300/70"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-lg font-bold tracking-tight text-cream-50">
              {p.step}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-cream-100/55">
              {p.detail}
            </p>
            <span
              aria-hidden="true"
              className="absolute inset-x-7 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-teal-400 to-transparent transition-transform duration-500 group-hover:scale-x-100"
            />
          </li>
        ))}
      </ol>

      <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-cream-100/45">
        In developing custom software we see our role as partners, not merely
        programmers — solutions succeed because end-users and internal IT staff
        feel ownership of them.
      </p>
    </Section>
  );
}
