import { useState } from "react";
import { company, engagementModels } from "../data/site";
import { ArrowRight, Button, Section, SectionHeading } from "./primitives";

const field =
  "w-full rounded-2xl bg-ink-950/50 px-4 py-3 text-sm text-cream-50 ring-1 ring-cream-100/10 outline-none transition placeholder:text-cream-100/30 focus:ring-teal-400/70";

const label = "mb-2 block text-xs font-semibold tracking-wide text-cream-100/60";

export function Contact({
  brief,
  setBrief,
}: {
  brief: string;
  setBrief: (v: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [model, setModel] = useState(engagementModels[1].name);

  /**
   * No backend is wired up yet, so the form hands the enquiry to the visitor's
   * mail client, addressed to the company inbox with everything filled in.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = `Project enquiry — ${org || name || "New enquiry"}`;
    const body = [
      `Name: ${name}`,
      `Organization: ${org}`,
      `Email: ${email}`,
      `Preferred engagement model: ${model}`,
      "",
      "Project brief:",
      brief || "(not provided)",
    ].join("\n");

    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <Section id="contact" className="border-t border-cream-100/8">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            eyebrow="Start a project"
            title="Tell us what you need built"
            lead="We invest the time up front to understand the requirement, then come back with scope, the engagement model we would recommend, and a competitive price."
          />

          <div className="mt-12 space-y-8">
            {company.offices.map((office) => (
              <div
                key={office.label}
                className="rounded-3xl border border-cream-100/8 bg-ink-900/40 p-7"
              >
                <p className="font-mono text-[11px] tracking-[0.16em] text-teal-300/90 uppercase">
                  {office.label}
                </p>
                <dl className="mt-5 space-y-3">
                  {office.lines.map((line) => (
                    <div
                      key={`${office.label}-${line.k}`}
                      className="flex items-baseline gap-4"
                    >
                      <dt className="w-20 shrink-0 text-xs text-cream-100/40">
                        {line.k}
                      </dt>
                      <dd>
                        <a
                          href={line.href}
                          className="text-sm text-cream-100/85 transition hover:text-teal-300"
                        >
                          {line.v}
                        </a>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="ring-hairline h-fit rounded-4xl bg-gradient-to-b from-ink-900/80 to-ink-900/30 p-8 sm:p-10"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="c-name">
                Your name
              </label>
              <input
                id="c-name"
                className={field}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Okafor"
                required
              />
            </div>
            <div>
              <label className={label} htmlFor="c-org">
                Organization
              </label>
              <input
                id="c-org"
                className={field}
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="Acme Distribution"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className={label} htmlFor="c-email">
              Work email
            </label>
            <input
              id="c-email"
              type="email"
              className={field}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@acme.com"
              required
            />
          </div>

          <div className="mt-5">
            <label className={label} htmlFor="c-model">
              Engagement model
            </label>
            <select
              id="c-model"
              className={field}
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {engagementModels.map((m) => (
                <option key={m.name} value={m.name} className="bg-ink-900">
                  {m.name}
                </option>
              ))}
              <option value="Not sure yet" className="bg-ink-900">
                Not sure yet — advise us
              </option>
            </select>
          </div>

          <div className="mt-5">
            <label className={label} htmlFor="c-brief">
              Project brief
            </label>
            <textarea
              id="c-brief"
              rows={5}
              className={`${field} resize-none`}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="What are you building, what does it need to connect to, and when do you need it live?"
              required
            />
          </div>

          <Button type="submit" className="mt-7 w-full">
            Send enquiry
            <ArrowRight />
          </Button>

          <p className="mt-4 text-center text-xs text-cream-100/40">
            Opens your mail client, addressed to {company.email}
          </p>
        </form>
      </div>
    </Section>
  );
}
