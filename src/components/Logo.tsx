import { company } from "../data/site";

/**
 * Circular badge mark: cream monogram on the deep navy ground of the VBC
 * identity, with the company name set around the ring.
 */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${company.short} logo`}
      className="shrink-0"
    >
      <defs>
        <path
          id="vbc-ring"
          d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1 -74 0"
          fill="none"
        />
        <linearGradient id="vbc-mono" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbf6e7" />
          <stop offset="100%" stopColor="#e3bd6b" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="49" fill="#0a1520" />
      <circle
        cx="50"
        cy="50"
        r="43"
        fill="none"
        stroke="#efdfb4"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />

      <text
        fill="#efdfb4"
        fontSize="10.5"
        fontWeight="600"
        letterSpacing="2.6"
        fontFamily="'Plus Jakarta Sans', sans-serif"
      >
        <textPath href="#vbc-ring" startOffset="50%" textAnchor="middle">
          VIRTUAL BRIDGE CONNECT
        </textPath>
      </text>

      {/* Monogram: two piers and the span between them. */}
      <g fill="url(#vbc-mono)">
        <rect x="26" y="42" width="6" height="26" rx="2" />
        <rect x="68" y="42" width="6" height="26" rx="2" />
      </g>
      <path
        d="M29 45c0-12 42-12 42 0"
        fill="none"
        stroke="url(#vbc-mono)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="50" cy="55" r="4.5" fill="#2dd4bf" />
    </svg>
  );
}

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <a
      href="#top"
      className="flex items-center gap-3 transition hover:opacity-90"
      aria-label={`${company.name} — home`}
    >
      <LogoMark size={size} />
      <span className="hidden leading-tight sm:block">
        <span className="block text-sm font-bold tracking-tight text-cream-50">
          Virtual Bridge Connect
        </span>
        <span className="block font-mono text-[10px] tracking-[0.16em] text-teal-300/80 uppercase">
          {company.tagline}
        </span>
      </span>
    </a>
  );
}
