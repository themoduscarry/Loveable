import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Virtual Bridge Connect, LLC — Let's Grow Together",
    template: "%s — Virtual Bridge Connect",
  },
  description:
    "Virtual Bridge Connect LLC is a US-based software development, IT services and consultancy firm delivering competitively priced outsourcing to companies worldwide since 2019.",
  metadataBase: new URL("https://vbc-ai-studio.vercel.app"),
  openGraph: {
    type: "website",
    siteName: "Virtual Bridge Connect, LLC",
    title: "Virtual Bridge Connect, LLC — Let's Grow Together",
    description:
      "Software development, IT services and consultancy — competitively priced outsourcing for companies worldwide since 2019.",
  },
  twitter: {
    card: "summary",
    title: "Virtual Bridge Connect, LLC — Let's Grow Together",
    description:
      "Software development, IT services and consultancy — competitively priced outsourcing for companies worldwide since 2019.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="theme-color" content="#0a1520" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
