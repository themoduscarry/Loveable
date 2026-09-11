"use client";

import { useState } from "react";
import { CTA } from "@/components/marketing/CTA";
import { Clients } from "@/components/marketing/Clients";
import { Contact } from "@/components/marketing/Contact";
import { Engagement } from "@/components/marketing/Engagement";
import { Expertise } from "@/components/marketing/Expertise";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "@/components/marketing/Hero";
import { Nav } from "@/components/marketing/Nav";
import { Process } from "@/components/marketing/Process";
import { Services } from "@/components/marketing/Services";
import { WhyUs } from "@/components/marketing/WhyUs";

export default function Home() {
  const [brief, setBrief] = useState("");

  return (
    <div className="min-h-dvh bg-ink-950 text-cream-100">
      <Nav />
      <main>
        <Hero
          brief={brief}
          setBrief={setBrief}
          onSubmit={() => {
            document
              .getElementById("contact")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
        <Clients />
        <Services />
        <Expertise />
        <Process />
        <WhyUs />
        <Engagement />
        <Contact brief={brief} setBrief={setBrief} />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
