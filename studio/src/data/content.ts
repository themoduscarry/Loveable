export const product = {
  name: "VBC AI Studio",
  tagline: "Ship apps your credits survive.",
  company: "Virtual Bridge Connect",
};

export const comparison = [
  {
    dimension: "Code ownership",
    them: "Hostage in the vendor's environment; export is delayed or degraded on cancellation.",
    us: "100% native GitHub sync — every edit is a real commit to your own repo, instantly.",
  },
  {
    dimension: "Failed code runs",
    them: "Full credit consumption per attempt, including hallucinated, unbuildable loops.",
    us: "Code Guard rollback — a failed build reverts instantly and costs a 10% diagnostic fee, not a full generation.",
  },
  {
    dimension: "Hosting taxes",
    them: "Background hosting/DB fees keep billing even when you're not building.",
    us: "$0 idle taxes. Ships to your own Vercel or Netlify account — stays online after you stop paying us.",
  },
  {
    dimension: "Model transparency",
    them: "Silent downgrades to smaller models under peak load, without disclosure.",
    us: "Frontier guarantee on deep logic tasks, with real-time token tracking so you see exactly what ran.",
  },
  {
    dimension: "Large-app context",
    them: "Past ~15 components, context decays — intact files get rewritten, helpers break.",
    us: "AST-aware context engine passes dependency trees and relevant chunks, not the whole codebase.",
  },
] as const;

export const painPoints = [
  {
    title: "Credit burn",
    body: "Users report losing $30+ to AI infinite-error loops before a build ever succeeds.",
    fix: "In-buffer compilation catches the failure before it ever reaches a commit — or a full credit charge.",
  },
  {
    title: "Vendor lock-in",
    body: "Cancel the subscription and the app degrades or disappears with it.",
    fix: "Code lives on your own GitHub and deploys to your own Vercel/Netlify. It stays online indefinitely.",
  },
  {
    title: "Context degradation",
    body: "Cross a rough 15-component threshold and generations start rewriting files that already worked.",
    fix: "AST-aware chunking sends the model a dependency tree, not the entire repository, every time.",
  },
] as const;

export type Persona = {
  key: string;
  title: string;
  points: string[];
};

export const personas: Persona[] = [
  {
    key: "noob",
    title: "Non-technical creators",
    points: [
      "Natural-language prompt-to-app orchestration",
      "Visual click-to-edit — click any element, describe the change in plain English",
      "One-click publish, no terminal or Git required",
    ],
  },
  {
    key: "dev",
    title: "Professional developers",
    points: [
      "Full Monaco IDE with real TypeScript & framework support",
      "Side-by-side dirty diffs before anything commits",
      "Direct two-way GitHub branch management and terminal logs",
    ],
  },
  {
    key: "agency",
    title: "Digital agencies & teams",
    points: [
      "Client mockups in minutes, not days",
      "Zero server management overhead per client project",
      "White-label export and multi-seat workspace controls",
    ],
  },
];

export type PricingTier = {
  name: string;
  price: string;
  priceNote?: string;
  credits: string;
  features: string[];
  featured?: boolean;
};

export const pricingTiers: PricingTier[] = [
  {
    name: "Free Starter",
    price: "$0",
    priceNote: "/month",
    credits: "30 credits / mo",
    features: [
      "Public GitHub sync",
      "Live WebContainer preview",
      "Community support",
    ],
  },
  {
    name: "Pro Builder",
    price: "$24",
    priceNote: "/month ($19/mo billed yearly)",
    credits: "1,200 credits / mo",
    features: [
      "Private & public GitHub sync",
      "Code Guard protection",
      "Frontier model routing",
      "60-day credit rollover",
    ],
    featured: true,
  },
  {
    name: "Agency / Team",
    price: "$69",
    priceNote: "/month ($55/mo billed yearly)",
    credits: "4,500 credits / mo",
    features: [
      "3 team seats",
      "White-label client preview",
      "Priority LLM execution queue",
    ],
  },
];

export const codeGuardStages = [
  {
    stage: "01",
    title: "In-memory diff",
    body: "Candidate edits land in an ephemeral buffer — nothing touches your git branch HEAD yet.",
  },
  {
    stage: "02",
    title: "Static analysis",
    body: "An immediate TypeScript check (tsc --noEmit) catches missing imports, type mismatches and syntax errors.",
  },
  {
    stage: "03",
    title: "Runtime listener",
    body: "A headless preview render catches uncaught exceptions and React boundary crashes before you ever see them.",
  },
  {
    stage: "04",
    title: "Commit or rollback",
    body: "Pass: it's committed to GitHub, full credits charged. Fail: instant rollback, capped at a 10% diagnostic fee.",
  },
] as const;

export const roadmap = [
  {
    phase: "Months 1–2",
    title: "Foundation",
    items: [
      "WebContainer + Monaco core IDE workspace",
      "Supabase auth, schema and credit ledger",
      "Direct outreach to disgruntled Lovable/Bolt users",
    ],
    target: "30 Pro users · $720 MRR",
  },
  {
    phase: "Months 3–4",
    title: "Public growth",
    items: [
      "Public launch on Product Hunt & Hacker News",
      "Code Guard engine released publicly",
      "Referral campaign for GitHub logins",
    ],
    target: "120 Pro + 15 Agency · $3,915 MRR",
  },
  {
    phase: "Months 5–6",
    title: "Agency scale",
    items: [
      "B2B cold outreach to dev agencies",
      "White-label client handover features",
      "Credit top-up packs ($10 / $25)",
    ],
    target: "250 Pro + 58 Agency · $10,002 MRR",
  },
] as const;
