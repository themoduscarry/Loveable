import Link from "next/link";
import {
  codeGuardStages,
  comparison,
  painPoints,
  personas,
  pricingTiers,
  product,
  roadmap,
} from "@/data/content";
import { Button, Card, Check, Section, SectionHeading } from "@/components/ui";

export default function Home() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-cream-100/8 bg-ink-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-teal-400/15 font-mono text-sm font-bold text-teal-300">
              VB
            </span>
            <span className="text-sm font-bold tracking-tight text-cream-50">
              {product.name}
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {[
              ["Code Guard", "#code-guard"],
              ["Pricing", "#pricing"],
              ["Roadmap", "#roadmap"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-full px-4 py-2 text-sm font-medium text-cream-100/70 transition hover:bg-cream-100/8 hover:text-cream-50"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button href="/login" variant="ghost" className="hidden sm:inline-flex">
              Sign in
            </Button>
            <Button href="/login">Start building</Button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------- hero --- */}
      <section className="relative overflow-hidden pt-36 pb-20 lg:pt-44">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="bg-mesh absolute inset-0 opacity-60" />
          <div className="absolute top-[-16rem] left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-teal-500/10 blur-[130px]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-950" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="ring-hairline inline-flex items-center gap-2.5 rounded-full bg-ink-900/70 py-1.5 pr-4 pl-1.5 text-sm text-cream-100/80">
              <span className="rounded-full bg-teal-400/15 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-teal-300 uppercase">
                Built by VBC
              </span>
              A browser IDE that doesn&apos;t hold your app hostage
            </span>

            <h1 className="mt-8 text-5xl leading-[1.03] font-extrabold tracking-tight text-balance sm:text-6xl">
              <span className="text-cream-50">Ship apps</span>
              <br />
              <span className="text-gradient">your credits survive.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-cream-100/65">
              Prompt-to-app, powered by frontier models, with native two-way
              GitHub sync, zero idle hosting fees, and a Code Guard engine
              that rolls back broken builds before they burn your credits.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/login" className="w-full sm:w-auto">
                Start building free
              </Button>
              <Button href="#code-guard" variant="outline" className="w-full sm:w-auto">
                See Code Guard in action
              </Button>
            </div>
            <p className="mt-4 text-xs text-cream-100/40">
              30 free credits. No card required.
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- pain points --- */}
      <Section className="border-t border-cream-100/8">
        <SectionHeading
          eyebrow="Why we exist"
          title="The complaints we kept reading on r/lovable"
          lead="Voice-of-customer synthesis across Reddit, X and Hacker News surfaced the same three failures, over and over."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {painPoints.map((p) => (
            <Card key={p.title}>
              <h3 className="text-lg font-bold tracking-tight text-cream-50">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-cream-100/55">
                {p.body}
              </p>
              <div className="mt-5 flex items-start gap-2.5 border-t border-cream-100/8 pt-4 text-sm text-teal-300/90">
                <Check className="mt-0.5" />
                {p.fix}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------------- comparison --- */}
      <Section className="border-t border-cream-100/8">
        <SectionHeading
          eyebrow="How we're different"
          title="Same prompt-to-app category, structurally different guarantees"
          align="center"
        />
        <div className="mt-14 overflow-x-auto rounded-3xl border border-cream-100/8">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-cream-100/8 bg-ink-900/60 text-left">
                <th className="p-5 font-mono text-[11px] tracking-[0.14em] text-cream-100/40 uppercase">
                  Dimension
                </th>
                <th className="p-5 font-mono text-[11px] tracking-[0.14em] text-cream-100/40 uppercase">
                  Typical platform
                </th>
                <th className="p-5 font-mono text-[11px] tracking-[0.14em] text-teal-300 uppercase">
                  {product.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.dimension} className="border-b border-cream-100/6 last:border-0">
                  <td className="p-5 align-top font-semibold text-cream-50">
                    {row.dimension}
                  </td>
                  <td className="p-5 align-top text-cream-100/55">{row.them}</td>
                  <td className="p-5 align-top text-cream-100/85">{row.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* -------------------------------------------------------- code guard --- */}
      <Section id="code-guard" className="border-t border-cream-100/8">
        <SectionHeading
          eyebrow="The moat"
          title="Code Guard: the anti-regression engine"
          lead="Every AI edit passes through four stages before it ever touches your repository or your bill."
        />
        <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-cream-100/8 sm:grid-cols-2 lg:grid-cols-4">
          {codeGuardStages.map((s) => (
            <li key={s.stage} className="bg-ink-950 p-7">
              <span className="font-mono text-sm text-teal-300/70">{s.stage}</span>
              <h3 className="mt-4 text-lg font-bold tracking-tight text-cream-50">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-cream-100/55">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-cream-100/45">
          Fail Code Guard and the sandbox reverts instantly — you&apos;re
          charged a capped 10% diagnostic fee, never a full generation, for a
          build that never shipped.
        </p>
      </Section>

      {/* --------------------------------------------------------- personas --- */}
      <Section className="border-t border-cream-100/8">
        <SectionHeading
          eyebrow="Who it's for"
          title="One workspace, three ways of working"
          align="center"
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {personas.map((p) => (
            <Card key={p.key}>
              <h3 className="text-lg font-bold tracking-tight text-cream-50">
                {p.title}
              </h3>
              <ul className="mt-5 space-y-2.5">
                {p.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-cream-100/70">
                    <Check className="mt-0.5 text-teal-400" />
                    {point}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------- pricing --- */}
      <Section id="pricing" className="border-t border-cream-100/8">
        <SectionHeading
          eyebrow="Pricing"
          title="Pay for orchestration, not idle servers"
          align="center"
        />
        <div className="mt-14 grid items-start gap-5 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <article
              key={tier.name}
              className={
                tier.featured
                  ? "relative rounded-4xl bg-gradient-to-b from-ink-850 to-ink-900 p-8 shadow-[0_0_0_1px_rgba(45,212,191,0.25),0_18px_60px_-18px_rgba(45,212,191,0.45)] lg:-mt-6 lg:pb-10"
                  : "ring-hairline rounded-4xl bg-ink-900/50 p-8"
              }
            >
              {tier.featured ? (
                <span className="rounded-full bg-teal-400 px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-ink-950 uppercase">
                  Most popular
                </span>
              ) : null}
              <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-cream-50">
                {tier.name}
              </h3>
              <p className="mt-3">
                <span className="text-4xl font-extrabold text-cream-50">{tier.price}</span>
                {tier.priceNote ? (
                  <span className="ml-1 text-sm text-cream-100/50">{tier.priceNote}</span>
                ) : null}
              </p>
              <p className="mt-2 font-mono text-xs text-teal-300/80">{tier.credits}</p>
              <ul className="mt-7 space-y-3 border-t border-cream-100/10 pt-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-cream-100/75">
                    <Check className="mt-0.5 text-teal-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                href="/login"
                variant={tier.featured ? "primary" : "outline"}
                className="mt-8 w-full"
              >
                {tier.name === "Free Starter" ? "Start free" : "Choose plan"}
              </Button>
            </article>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------- roadmap --- */}
      <Section id="roadmap" className="border-t border-cream-100/8">
        <SectionHeading
          eyebrow="Where we're headed"
          title="The 6-month path to $10K MRR"
          align="center"
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {roadmap.map((r) => (
            <Card key={r.phase}>
              <p className="font-mono text-[11px] tracking-[0.16em] text-teal-300/90 uppercase">
                {r.phase}
              </p>
              <h3 className="mt-2 text-xl font-bold tracking-tight text-cream-50">
                {r.title}
              </h3>
              <ul className="mt-5 space-y-2.5">
                {r.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-cream-100/65">
                    <Check className="mt-0.5 text-teal-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-cream-100/8 pt-4 text-sm font-semibold text-cream-50">
                Target: {r.target}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <footer className="border-t border-cream-100/8 px-5 py-10 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-cream-100/45">
            {product.name} is built by {product.company}.
          </p>
          <a
            href="https://virtualbridgeconnect.com"
            className="text-sm text-cream-100/60 transition hover:text-teal-300"
          >
            virtualbridgeconnect.com →
          </a>
        </div>
      </footer>
    </>
  );
}
