import { domains, engagementModels } from "@/data/company";
import { ArrowRight, Button, Check, Section, SectionHeading } from "./primitives";

export function Engagement() {
  return (
    <Section id="engagement" className="border-t border-cream-100/8">
      <SectionHeading
        eyebrow="Engagement models"
        title="Pick the shape of the relationship, not just the price"
        lead="We offer the pricing structure that actually suits the work — and we will tell you which one we think fits before you commit to it."
        align="center"
      />

      <div className="mt-16 grid items-start gap-5 lg:grid-cols-3">
        {engagementModels.map((m) => (
          <article
            key={m.name}
            className={
              m.featured
                ? "glow-teal relative rounded-4xl bg-gradient-to-b from-ink-850 to-ink-900 p-8 lg:-mt-6 lg:pb-10"
                : "ring-hairline rounded-4xl bg-ink-900/50 p-8 transition duration-300 hover:bg-ink-850/60"
            }
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={`rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.14em] uppercase ${
                  m.featured
                    ? "bg-teal-400 text-ink-950"
                    : "bg-cream-100/8 text-cream-100/55"
                }`}
              >
                {m.pitch}
              </span>
            </div>

            <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-cream-50">
              {m.name}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-cream-100/60">
              {m.body}
            </p>

            <ul className="mt-7 space-y-3 border-t border-cream-100/10 pt-6">
              {m.points.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-3 text-sm text-cream-100/75"
                >
                  <Check className="mt-0.5 text-teal-400" />
                  {p}
                </li>
              ))}
            </ul>

            <Button
              href="#contact"
              variant={m.featured ? "primary" : "outline"}
              className="mt-8 w-full"
            >
              Discuss this model
              <ArrowRight />
            </Button>
          </article>
        ))}
      </div>

      {/* Outsourcing domains */}
      <div className="mt-16 flex flex-col items-center gap-6 rounded-3xl border border-cream-100/8 bg-ink-900/30 px-8 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-cream-100/40 uppercase">
            Outsourcing domains
          </p>
          <p className="mt-2 text-base text-cream-100/70">
            Scalable IT outsourcing across four domains, offered through any of
            the engagement models above.
          </p>
        </div>
        <ul className="flex flex-wrap justify-center gap-2">
          {domains.map((d) => (
            <li
              key={d}
              className="ring-hairline rounded-full bg-ink-950/50 px-4 py-2 text-sm font-medium text-cream-100/70"
            >
              {d}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
