export const company = {
  name: "Virtual Bridge Connect, LLC",
  short: "Virtual Bridge Connect",
  initials: "VBC",
  tagline: "Let's Grow Together.",
  founded: 2019,
  website: "virtualbridgeconnect.com",
  facebook: "https://www.facebook.com/virtualbridgeconnect",
  email: "virtualbridgeconnect@gmail.com",
  offices: [
    {
      label: "USA — Herndon Office",
      lines: [
        { k: "Phone", v: "+1 (708) 616-0411", href: "tel:+17086160411" },
        {
          k: "WhatsApp",
          v: "+1 (208) 417-1548",
          href: "https://wa.me/12084171548",
        },
        {
          k: "Email",
          v: "virtualbridgeconnect@gmail.com",
          href: "mailto:virtualbridgeconnect@gmail.com",
        },
      ],
    },
    {
      label: "Pakistan — Support",
      lines: [
        { k: "Phone", v: "0092-321-745-2433", href: "tel:+923217452433" },
        {
          k: "Email",
          v: "virtualbridgeconnect@gmail.com",
          href: "mailto:virtualbridgeconnect@gmail.com",
        },
      ],
    },
  ],
};

export const nav = [
  { label: "Services", href: "#services" },
  { label: "Expertise", href: "#expertise" },
  { label: "Process", href: "#process" },
  { label: "Why Us", href: "#why-us" },
  { label: "Engagement", href: "#engagement" },
  { label: "AI Studio", href: "/studio" },
];

/* ---------------------------------------------------------------- hero ---- */

export const heroPrompts = [
  "An e-commerce storefront on Magento with a custom checkout",
  "A dedicated offshore team of four .NET engineers",
  "An ERP module for inventory and production management",
  "An iOS and Android app for our field service crew",
  "A WordPress rebuild of our corporate site, mobile-first",
];

export const heroStats = [
  { value: "2019", label: "Serving clients since" },
  { value: "3", label: "Engagement models" },
  { value: "8", label: "Step delivery roadmap" },
  { value: "2", label: "Continents, one team" },
];

/* ------------------------------------------------------------- services ---- */

export type Service = {
  title: string;
  blurb: string;
  items: string[];
  group: "Information Technology" | "Creative & Design" | "Growth";
};

export const services: Service[] = [
  {
    title: "Web Development",
    group: "Information Technology",
    blurb:
      "The core of our business — high-impact design paired with solid engineering, from custom sites to web 2.0 applications and intranets of any complexity.",
    items: [
      "Custom web design & development",
      "Web apps",
      "E-commerce solutions & storefronts",
      "Enterprise portal development",
      "Application maintenance",
    ],
  },
  {
    title: "Software Development",
    group: "Information Technology",
    blurb:
      "State-of-the-art custom software for midsize and large organizations. Our RAD model cuts development time and the cost of maintaining enterprise applications.",
    items: [
      "Custom software development",
      "Software migration & re-engineering",
      "Software testing & QA",
    ],
  },
  {
    title: "Open Source & CMS",
    group: "Information Technology",
    blurb:
      "Customization and implementation across the platforms your team already knows — templates, custom modules, and functionality changes that fit your workflow.",
    items: [
      "WordPress",
      "Magento",
      "Joomla",
      "DotNetNuke",
      "Sitefinity",
      "dasBlog & YetAnotherForum.NET",
      "CWS — our own tailor-built CMS",
    ],
  },
  {
    title: "Mobile Applications",
    group: "Information Technology",
    blurb:
      "Value-added apps built exactly to your requirements, taken from design through development and testing by one proficient team.",
    items: ["iOS (iPhone / iPad)", "Android", "Windows Mobile", "BlackBerry"],
  },
  {
    title: "Custom Enterprise Solutions",
    group: "Information Technology",
    blurb:
      "Generic software rarely bends to a unique business. We design cost-effective, tailor-built, high-performance systems for organizations that need made-to-order solutions.",
    items: [
      "Customer relationship management",
      "Supply chain management",
      "Management information systems",
      "Sales, accounting & financial management",
      "Material planning & quality management",
      "Inventory & production management",
      "BI / KPI consoles",
    ],
  },
  {
    title: "Technology Integration",
    group: "Information Technology",
    blurb:
      "Standalone systems cost you hours in re-keying and reconciliation. We connect diverse data and information sources into a single coherent framework.",
    items: [
      "Business & system integration",
      "Enterprise software integration",
      "Integration architecture",
      "Security across internal & external processes",
    ],
  },
  {
    title: "MIS Outsourcing",
    group: "Information Technology",
    blurb:
      "We relieve small and medium businesses of the burden of full-time, costly internal IT staff while improving the infrastructure underneath them.",
    items: [
      "Business grade IT support",
      "Guaranteed response times",
      "Expert technology advice",
      "Professional trackable systems",
    ],
  },
  {
    title: "Creative, Design & Multimedia",
    group: "Creative & Design",
    blurb:
      "A dedicated graphic design team with deep commercial experience, covering everything from a first logo to a finished television spot.",
    items: [
      "Logo design",
      "Stationery design",
      "Web design",
      "Internet advertising",
      "Print media design",
      "Multimedia design",
      "Mobile app design",
    ],
  },
  {
    title: "Social Media Services",
    group: "Growth",
    blurb:
      "Our specialists manage your presence across Facebook, YouTube, LinkedIn and Twitter, so positioning the brand stays deliberate rather than accidental.",
    items: [
      "Social space setup",
      "Initial follower growth",
      "Content creation & visual design",
      "Fan interaction & community replies",
      "Sales-oriented posting",
      "Corporate & e-commerce site integration",
      "Blog setup & posting",
      "Weekly / monthly reporting",
    ],
  },
  {
    title: "Consultancy Services",
    group: "Growth",
    blurb:
      "We help you build a vision for the future and reach consensus on investment priorities, then turn strategy into a phased plan with budgets, owners and dates.",
    items: [
      "IT management & consulting",
      "Business analysis",
      "HR consulting",
      "Vendor selection & contract negotiation",
      "ROI analysis & second opinions",
    ],
  },
];

/* ------------------------------------------------------------ expertise ---- */

export const expertise: { area: string; skills: string[] }[] = [
  {
    area: "Web",
    skills: [
      "Custom web design & development",
      "Web apps",
      "E-commerce solutions & storefronts",
      "Enterprise portal development",
      "Application maintenance",
    ],
  },
  {
    area: "Mobile",
    skills: ["iPhone development", "Android development"],
  },
  {
    area: "Enterprise",
    skills: ["Custom enterprise solutions", "Package ERP implementers"],
  },
  {
    area: "Software",
    skills: [
      "Software development",
      "Software migration & re-engineering",
      "Software testing",
    ],
  },
  {
    area: "Content Management",
    skills: ["Open source CMS implementation", "Custom built CMS solutions"],
  },
  {
    area: "Consulting",
    skills: ["HR consulting", "IT management & consulting"],
  },
  {
    area: "Creative",
    skills: [
      "Logo design",
      "Stationery design",
      "Web design",
      "Internet advertising",
      "Print media design",
      "Multimedia design",
      "Mobile app design",
    ],
  },
  {
    area: "Social Media",
    skills: [
      "Social space setup",
      "Content creation",
      "Visual design",
      "Sales-oriented posting",
      "Website integration",
      "Blog setup & posting",
      "Weekly / monthly reporting",
    ],
  },
];

export const platforms = [
  "WordPress",
  "Magento",
  "Joomla",
  "DotNetNuke",
  "Sitefinity",
  "dasBlog",
  "YetAnotherForum.NET",
  "CWS",
  ".NET",
  "PHP",
  "MySQL",
  "HTML5",
  "CSS3",
  "jQuery",
  "Ajax",
  "Xcode",
  "Objective-C",
  "Android SDK",
  "Java",
];

/* -------------------------------------------------------------- process ---- */

export const process = [
  {
    step: "Data mining",
    detail:
      "We start in your business, not in an editor — gathering the requirements, constraints and numbers the solution has to satisfy.",
  },
  {
    step: "Forming a sketch",
    detail:
      "The shape of the system, agreed early and cheaply, while changing it still costs a conversation rather than a rebuild.",
  },
  {
    step: "Designing",
    detail:
      "Interface and experience work that carries your corporate image rather than fighting it.",
  },
  {
    step: "Making a blueprint",
    detail:
      "Technical design, data model and integration points documented before a line of production code.",
  },
  {
    step: "Constructing",
    detail:
      "Build in reviewed increments, so you can see progress at our end at every stage.",
  },
  {
    step: "Testing",
    detail:
      "Our QA department tests throughout the process — not as a gate bolted on at the end.",
  },
  {
    step: "Deployment",
    detail:
      "Release, migration and handover, with your internal IT staff brought along rather than surprised.",
  },
  {
    step: "Maintenance & upgradation",
    detail:
      "Ongoing support and enhancement, because solutions succeed when end-users feel ownership.",
  },
];

/* --------------------------------------------------------------- why us ---- */

export const reasons = [
  {
    title: "Intellect & Experience",
    body: "Highly skilled professionals with expertise across diverse business and technology areas. We employ the best technicians, adhere to proven methodology, and become a true business partner on every project.",
  },
  {
    title: "Our Approach",
    body: "A roadmap to development in eight steps, each with its own significance — from data mining through to maintenance and upgradation.",
  },
  {
    title: "Commitment to Quality",
    body: "We listen carefully and provide space, time and materials according to agreement. Our Quality Assurance department tests throughout the process to ensure the project will be successful.",
  },
  {
    title: "On Time Delivery",
    body: "We invest the time up front to understand your needs, then manage to deliver on time and within budget — limiting uncertainty and keeping you aware of progress at our end.",
  },
  {
    title: "Competitive Pricing",
    body: "Services at genuinely competitive prices, with the pricing model matched to the engagement: fixed price, time and effort, or a dedicated offshore team.",
  },
  {
    title: "Track Record",
    body: "Small to large scale projects delivered for organizations of all sizes. Our growing list of satisfied customers acts as both our references and our source of repeat business.",
  },
];

/* ----------------------------------------------------------- engagement ---- */

export const engagementModels = [
  {
    name: "Fixed Price Model",
    pitch: "For well-defined scope",
    body: "The low-risk option. We work with you to define proper deliverables and timelines, and agree a fixed price against them.",
    points: [
      "Scope and deliverables agreed up front",
      "Predictable, mutually agreed cost",
      "Milestone-based delivery",
      "Lowest risk profile",
    ],
    featured: false,
  },
  {
    name: "Dedicated Offshore Team",
    pitch: "Most popular",
    body: "A team working exclusively 40 hours per week for you, under your optimal control. We assemble the project managers, team members, equipment and infrastructure around your needs.",
    points: [
      "40 hours per week, exclusively yours",
      "Under your direct control",
      "PMs, engineers and designers included",
      "Dedicated offshore infrastructure & support",
      "Rapid team mobilization",
    ],
    featured: true,
  },
  {
    name: "Time & Material Model",
    pitch: "For evolving scope",
    body: "Suited to complex projects where changes need to be met rapidly on an ongoing basis. You keep the flexibility to amend the specification while the project is moving.",
    points: [
      "Amend specification mid-flight",
      "Responsive to market trends",
      "Pay for effort actually delivered",
      "Best fit for discovery and R&D work",
    ],
    featured: false,
  },
];

export const domains = [
  "Project based",
  "Product development",
  "Resource outsourcing",
  "Managed IT",
];

export const valueProposition = [
  "Highly competent resources",
  "World class solutions on current technologies",
  "Low-cost advantage with flexible pricing structures",
  "Rapid project team mobilization",
  "Low attrition rates",
  "Speed of delivery — blended onsite / offshore",
  "Dedicated offshore development infrastructure",
  "Dedicated offshore support setup",
];

/* ------------------------------------------------------------ industries -- */

export const industries = [
  { sector: "Real Estate", kind: "Process manufacturing" },
  { sector: "Construction", kind: "Process manufacturing" },
  { sector: "Pest Control", kind: "Process manufacturing" },
  { sector: "HRIS", kind: "Process manufacturing" },
  { sector: "Clothing", kind: "Retail & distribution" },
  { sector: "Pharma", kind: "Retail & distribution" },
  { sector: "Data Design", kind: "Retail & distribution" },
  { sector: "Health Care", kind: "Manufacturing, retail & distribution" },
];

/* --------------------------------------------------------------- clients -- */

export const clients = [
  "SkyGiraffe",
  "SpendrPay",
  "ClassroomCatalyst",
  "E and E Media",
  "Shawarmer",
  "Sail for the World",
  "GingerCane",
  "Kringle",
  "SprintNow",
  "Proactive Accountants Network",
  "The Brokers Club",
  "G31000",
];
