import { ArrowRight, Button, Section } from "./primitives";

export function CTA() {
  return (
    <Section className="!py-20">
      <div className="relative overflow-hidden rounded-5xl border border-cream-100/10 bg-gradient-to-br from-ink-900 via-ink-850 to-ink-900 px-8 py-16 text-center sm:px-16">
        <div
          aria-hidden="true"
          className="bg-mesh absolute inset-0 opacity-40"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/15 blur-[140px]"
        />

        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-4xl leading-[1.1] font-extrabold tracking-tight text-balance text-cream-50 sm:text-5xl">
            Let's grow together.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-cream-100/65">
            Send us the brief today, and we'll come back with scope, model
            and price — usually within one business day.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="#top">
              Write your brief
              <ArrowRight />
            </Button>
            <Button href="#contact" variant="outline">
              Talk to a consultant
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
