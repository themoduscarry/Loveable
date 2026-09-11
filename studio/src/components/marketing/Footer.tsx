import { company, nav, services } from "@/data/company";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  const serviceLinks = services.slice(0, 6);

  return (
    <footer className="border-t border-cream-100/8 bg-ink-900/30">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo size={44} />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-100/50">
              A software development, IT services and consultancy firm
              providing competitively priced outsourcing to companies
              worldwide since {company.founded}.
            </p>
            <a
              href={company.facebook}
              target="_blank"
              rel="noreferrer"
              className="ring-hairline mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-cream-100/60 transition hover:bg-cream-100/8 hover:text-cream-50"
            >
              Facebook ↗
            </a>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-cream-100/40 uppercase">
              Navigate
            </p>
            <ul className="mt-5 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-cream-100/60 transition hover:text-cream-50"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  className="text-sm text-cream-100/60 transition hover:text-cream-50"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-cream-100/40 uppercase">
              Services
            </p>
            <ul className="mt-5 space-y-3">
              {serviceLinks.map((s) => (
                <li key={s.title}>
                  <a
                    href="#services"
                    className="text-sm text-cream-100/60 transition hover:text-cream-50"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-cream-100/40 uppercase">
              Reach us
            </p>
            <ul className="mt-5 space-y-3 text-sm text-cream-100/60">
              <li>
                <a
                  href="mailto:virtualbridgeconnect@gmail.com"
                  className="transition hover:text-cream-50"
                >
                  virtualbridgeconnect@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+17086160411" className="transition hover:text-cream-50">
                  +1 (708) 616-0411 — USA
                </a>
              </li>
              <li>
                <a href="tel:+923217452433" className="transition hover:text-cream-50">
                  0092-321-745-2433 — Pakistan
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream-100/8 pt-8 text-xs text-cream-100/35 sm:flex-row">
          <p>
            © {year} {company.name}. {company.tagline}
          </p>
          <p>{company.website}</p>
        </div>
      </div>
    </footer>
  );
}
