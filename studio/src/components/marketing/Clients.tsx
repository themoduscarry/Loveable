import { clients } from "@/data/company";

export function Clients() {
  const loop = [...clients, ...clients];

  return (
    <section
      aria-label="Selected clients"
      className="border-y border-cream-100/8 bg-ink-900/40 py-12"
    >
      <p className="mb-8 text-center font-mono text-[11px] tracking-[0.2em] text-cream-100/40 uppercase">
        Solutions delivered for organizations of all sizes
      </p>

      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <ul className="marquee-track flex w-max items-center gap-14 pr-14">
          {loop.map((name, i) => (
            <li
              key={`${name}-${i}`}
              aria-hidden={i >= clients.length ? "true" : undefined}
              className="text-lg font-semibold whitespace-nowrap text-cream-100/35 transition hover:text-cream-100/70"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
