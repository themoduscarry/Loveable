import type { Metadata } from "next";

// Overrides the root layout's company-wide metadata for everything
// under /studio/* — the AI Studio product gets its own title/description
// rather than inheriting the marketing site's.
export const metadata: Metadata = {
  title: {
    default: "VBC AI Studio — Ship apps your credits survive",
    template: "%s — VBC AI Studio",
  },
  description:
    "Browser-based AI development studio with native two-way GitHub sync, zero idle hosting, and Code Guard — the anti-regression engine that stops broken AI edits from draining your credits.",
  openGraph: {
    title: "VBC AI Studio — Ship apps your credits survive",
    description:
      "Browser-based AI development studio with native two-way GitHub sync, zero idle hosting, and Code Guard.",
  },
  twitter: {
    title: "VBC AI Studio — Ship apps your credits survive",
    description:
      "Browser-based AI development studio with native two-way GitHub sync, zero idle hosting, and Code Guard.",
  },
};

export default function StudioLayout({ children }: LayoutProps<"/studio">) {
  return children;
}
