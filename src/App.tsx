import { useState } from "react";
import { CTA } from "./components/CTA";
import { Clients } from "./components/Clients";
import { Contact } from "./components/Contact";
import { Engagement } from "./components/Engagement";
import { Expertise } from "./components/Expertise";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Process } from "./components/Process";
import { Services } from "./components/Services";
import { WhyUs } from "./components/WhyUs";

export default function App() {
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
