import Link from "next/link";
import type { ReactNode } from "react";

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`px-5 py-20 sm:px-8 lg:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-teal-300 uppercase">
      <span className="h-px w-6 bg-teal-400/60" aria-hidden="true" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-5 text-4xl leading-[1.08] font-extrabold tracking-tight text-balance text-cream-50 sm:text-5xl">
        {title}
      </h2>
      {lead ? (
        <p className="mt-5 text-lg leading-relaxed text-pretty text-cream-100/65">
          {lead}
        </p>
      ) : null}
    </div>
  );
}

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
  disabled = false,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition duration-200 whitespace-nowrap disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary:
      "bg-cream-100 text-ink-950 hover:bg-white hover:-translate-y-0.5 shadow-lg shadow-black/30",
    outline:
      "ring-hairline text-cream-100 hover:bg-cream-100/8 hover:-translate-y-0.5",
    ghost: "text-cream-100/75 hover:text-cream-50",
  } as const;
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls} aria-disabled={disabled || undefined}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`ring-hairline rounded-3xl bg-ink-900/60 p-7 backdrop-blur-sm transition duration-300 hover:bg-ink-850/70 ${className}`}
    >
      {children}
    </div>
  );
}

export function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`size-4 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 8.5 3.2 3.2L13 4.8" />
    </svg>
  );
}
