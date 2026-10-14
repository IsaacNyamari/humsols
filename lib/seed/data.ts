// Seed content. Real facts come only from the project brief; everything else is
// a clearly marked [PLACEHOLDER] to be replaced from the admin.

export const SEED_SERVICES = [
  {
    slug: "web-applications",
    title: "Web application development",
    icon: "app",
    summary:
      "Custom web apps, customer portals, dashboards and SaaS platforms that run your business from any browser.",
    body: `Spreadsheets, paper forms and WhatsApp groups only go so far. When your team and customers need one reliable place to work, we build a web application around the way your business actually runs.

We design, build, host and support web apps for small and medium businesses across Kenya — from internal tools used by five people to multi-tenant platforms used by many organisations, like our own **HS Water Billing**.`,
    features: [
      "Customer and staff portals with secure logins and roles",
      "Dashboards and reports from your live data",
      "Multi-tenant SaaS platforms",
      "M-Pesa and SMS integration",
      "Works on phones, tablets and desktops",
      "Hosting, backups and ongoing support",
    ],
    process: [
      {
        step: 1,
        title: "Discovery",
        text: "We learn how your business works today and what the app must do.",
      },
      {
        step: 2,
        title: "Proposal",
        text: "A clear scope, timeline and price in KES before any work starts.",
      },
      {
        step: 3,
        title: "Design & build",
        text: "We build in short stages and show you working screens as we go.",
      },
      {
        step: 4,
        title: "Launch & support",
        text: "We deploy, train your team and keep the system running.",
      },
    ],
    faqs: [
      {
        q: "Can you take over an existing system?",
        a: "[PLACEHOLDER: confirm policy on taking over existing systems]",
      },
      {
        q: "Will it work on mobile phones?",
        a: "Yes. Everything we build is designed to work on phones as well as computers.",
      },
    ],
  },
  {
    slug: "custom-software",
    title: "Custom software development",
    icon: "code",
    summary:
      "Business systems, automation, integrations and APIs that remove manual work and connect the tools you already use.",
    body: `Off-the-shelf software rarely fits a business exactly. We build custom systems that match your process, automate repetitive work and connect the tools you already depend on.

Typical projects include internal business systems, automated reports and notifications, integrations between existing software, and APIs that let your systems talk to each other.`,
    features: [
      "Business management systems built around your process",
      "Automation of repetitive tasks and reports",
      "Integrations between existing tools",
      "APIs for partners and mobile apps",
      "M-Pesa, SMS and email integration",
      "Data migration from spreadsheets and old systems",
    ],
    process: [
      {
        step: 1,
        title: "Understand the process",
        text: "We map the work as it happens today and where time is lost.",
      },
      {
        step: 2,
        title: "Agree the scope",
        text: "A written scope and fixed milestones, priced in KES.",
      },
      {
        step: 3,
        title: "Build & test",
        text: "Delivered in stages and tested with your real data.",
      },
      {
        step: 4,
        title: "Train & support",
        text: "We train users and support the system after launch.",
      },
    ],
    faqs: [
      {
        q: "Do I own the software you build?",
        a: "[PLACEHOLDER: confirm ownership/licensing terms]",
      },
    ],
  },
  {
    slug: "billing-systems",
    title: "Billing & management systems",
    icon: "receipt",
    summary:
      "Utility and water billing, subscription billing, invoicing, POS and inventory — with M-Pesa built in.",
    body: `Billing is where businesses lose the most money to errors and delays. We build and run billing and management systems that send accurate bills on time and make it easy for customers to pay.

Our flagship product is **HS Water Billing**, a multi-tenant water billing and borehole project management platform. We also build subscription billing, invoicing, point-of-sale and inventory systems.`,
    features: [
      "Utility and water billing with meter readings",
      "Subscription and recurring billing",
      "Invoicing and statements",
      "Point of sale (POS) and inventory",
      "M-Pesa payments and automatic reconciliation",
      "SMS and email bill notifications",
    ],
    process: [
      { step: 1, title: "Review your billing", text: "How you bill, collect and reconcile today." },
      {
        step: 2,
        title: "Choose the fit",
        text: "HS Water Billing, or a system built for your model.",
      },
      {
        step: 3,
        title: "Set up & migrate",
        text: "We configure tariffs and import your customers.",
      },
      {
        step: 4,
        title: "Go live & support",
        text: "We train your staff and support you after go-live.",
      },
    ],
    faqs: [
      {
        q: "Does it accept M-Pesa?",
        a: "Yes. M-Pesa integration is part of our billing and management systems.",
      },
      {
        q: "Can I try HS Water Billing?",
        a: "Yes — request access on the HS Water Billing site and our team will set you up.",
      },
    ],
  },
  {
    slug: "websites",
    title: "Website design & development",
    icon: "globe",
    summary:
      "Company websites, e-commerce stores and landing pages — plus hosting and maintenance.",
    body: `Your website is often the first thing a customer sees. We design and build fast, mobile-friendly websites that explain what you do and make it easy for people to contact you or buy from you.

We also host and maintain websites so they stay secure, up to date and online.`,
    features: [
      "Company and organisation websites",
      "E-commerce stores with M-Pesa checkout",
      "Landing pages for campaigns",
      "Mobile-friendly, fast-loading design",
      "Search engine basics (SEO) set up from day one",
      "Hosting, email, backups and maintenance",
    ],
    process: [
      { step: 1, title: "Brief", text: "Your goals, audience, pages and content." },
      { step: 2, title: "Design", text: "A design you approve before we build." },
      {
        step: 3,
        title: "Build & launch",
        text: "We build, test on phones and launch on your domain.",
      },
      { step: 4, title: "Maintain", text: "Optional hosting and maintenance plans." },
    ],
    faqs: [
      {
        q: "Can you host my website and email?",
        a: "Yes. We offer hosting and maintenance for the websites we build.",
      },
    ],
  },
  {
    slug: "cctv-installation",
    title: "CCTV installation",
    icon: "camera",
    summary:
      "Site survey, IP and analog cameras, NVR/DVR setup, remote viewing on your phone and maintenance contracts.",
    body: `Protect your home, business, estate or school with a CCTV system planned for your site. We start with a free site survey, recommend the right cameras and recorder, install everything neatly and set up viewing on your phone.

After installation we offer maintenance contracts to keep your cameras recording when you need them.`,
    features: [
      "Free site survey and recommendation",
      "IP and analog (HD) cameras, indoor and outdoor",
      "NVR / DVR setup and storage planning",
      "Remote viewing on your phone",
      "Neat cabling and installation",
      "Maintenance contracts",
    ],
    process: [
      {
        step: 1,
        title: "Free site survey",
        text: "We visit, assess coverage and note camera positions.",
      },
      { step: 2, title: "Quotation", text: "An itemised quote in KES." },
      {
        step: 3,
        title: "Installation",
        text: "Cameras, recorder and cabling installed and tested.",
      },
      { step: 4, title: "Handover", text: "Phone viewing set up and a walkthrough of the system." },
    ],
    faqs: [
      {
        q: "Is the site survey really free?",
        a: "Yes. Book a free site survey and we will recommend a system for your site.",
      },
      {
        q: "Can I watch the cameras on my phone?",
        a: "Yes. We set up remote viewing on your phone as part of the installation.",
      },
    ],
  },
  {
    slug: "internet",
    title: "Internet services (ISP)",
    icon: "wifi",
    summary: "Home and business internet with professional installation and packages by speed.",
    body: `Reliable internet for homes and businesses. Check whether we cover your estate or area, choose a package by speed and we will install and set up your connection.`,
    features: [
      "Home internet packages",
      "Business internet packages",
      "Professional installation and Wi-Fi setup",
      "Packages by speed, priced in KES",
      "Coverage check for your estate or area",
      "Local support",
    ],
    process: [
      { step: 1, title: "Check coverage", text: "Tell us your estate or area." },
      { step: 2, title: "Choose a package", text: "Pick a speed that fits your home or business." },
      { step: 3, title: "Installation", text: "We install and set up your Wi-Fi." },
      {
        step: 4,
        title: "Get connected",
        text: "Start browsing, with local support when you need it.",
      },
    ],
    faqs: [
      {
        q: "Which areas do you cover?",
        a: "[PLACEHOLDER: list coverage areas] Use the coverage check form and we will confirm.",
      },
    ],
  },
];

export const SEED_PACKAGES = [
  {
    name: "Home Basic [PLACEHOLDER]",
    audience: "home",
    speedMbps: 10,
    priceKes: 2500,
    installationFeeKes: 0,
    popular: false,
  },
  {
    name: "Home Plus [PLACEHOLDER]",
    audience: "home",
    speedMbps: 20,
    priceKes: 3500,
    installationFeeKes: 0,
    popular: true,
  },
  {
    name: "Home Max [PLACEHOLDER]",
    audience: "home",
    speedMbps: 40,
    priceKes: 5500,
    installationFeeKes: 0,
    popular: false,
  },
  {
    name: "Business Starter [PLACEHOLDER]",
    audience: "business",
    speedMbps: 20,
    priceKes: 6000,
    installationFeeKes: 0,
    popular: false,
  },
  {
    name: "Business Pro [PLACEHOLDER]",
    audience: "business",
    speedMbps: 50,
    priceKes: 12000,
    installationFeeKes: 0,
    popular: true,
  },
].map((p, i) => ({
  ...p,
  features: [
    "Unlimited data [PLACEHOLDER: confirm]",
    "Free Wi-Fi router [PLACEHOLDER: confirm]",
    "Local support",
  ],
  fairUse: "[PLACEHOLDER: fair-use policy and real prices to be confirmed before launch]",
  active: true,
  order: (i + 1) * 10,
}));

export const SEED_PROJECTS = [
  {
    slug: "hs-water-billing",
    title: "HS Water Billing",
    client: "Human Solutions (own product)",
    serviceSlugs: ["billing-systems", "web-applications"],
    summary: "Our multi-tenant water billing and borehole project management platform.",
    body: `HS Water Billing is a multi-tenant SaaS platform for water billing and borehole project management, built and run by Human Solutions.

[PLACEHOLDER: add screenshots, features in use and real results]`,
    results: [{ label: "[PLACEHOLDER: result]", value: "[PLACEHOLDER]" }],
    liveUrl: "https://water-billing.humsols.com",
    featured: true,
    published: true,
  },
  {
    slug: "placeholder-company-website",
    title: "[PLACEHOLDER: website project title]",
    client: "[PLACEHOLDER: client name]",
    serviceSlugs: ["websites"],
    summary: "[PLACEHOLDER: one-sentence summary of a real website project]",
    body: "[PLACEHOLDER: case study — the problem, what we built and the outcome]",
    results: [{ label: "[PLACEHOLDER: result]", value: "[PLACEHOLDER]" }],
    featured: true,
    published: true,
  },
  {
    slug: "placeholder-cctv-installation",
    title: "[PLACEHOLDER: CCTV project title]",
    client: "[PLACEHOLDER: client name]",
    serviceSlugs: ["cctv-installation"],
    summary: "[PLACEHOLDER: one-sentence summary of a real CCTV installation]",
    body: "[PLACEHOLDER: case study — site, cameras installed, outcome]",
    results: [{ label: "[PLACEHOLDER: cameras installed]", value: "[PLACEHOLDER]" }],
    featured: true,
    published: true,
  },
];

export const SEED_TESTIMONIALS = [1, 2, 3].map((n) => ({
  name: `[PLACEHOLDER: customer name ${n}]`,
  role: "[PLACEHOLDER: role]",
  company: "[PLACEHOLDER: company]",
  quote: "[PLACEHOLDER: a real testimonial from a customer, used with their permission]",
  rating: 5,
  isPlaceholder: true,
  published: true,
  order: n * 10,
}));

export const SEED_TEAM = [
  {
    name: "[PLACEHOLDER: team member name]",
    role: "[PLACEHOLDER: role]",
    bio: "[PLACEHOLDER: short bio]",
    order: 10,
    published: true,
  },
  {
    name: "[PLACEHOLDER: team member name]",
    role: "[PLACEHOLDER: role]",
    bio: "[PLACEHOLDER: short bio]",
    order: 20,
    published: true,
  },
];

export const SEED_FAQS = [
  {
    question: "Where are you based?",
    answer: "Our office is in Westlands, Nairobi, Kenya.",
    category: "general",
    order: 10,
  },
  {
    question: "How do I get a quote?",
    answer:
      "Use the Get a quote form, call us or message us on WhatsApp. Every quote is free and priced in Kenya shillings (KES).",
    category: "general",
    order: 20,
  },
  {
    question: "Do you support systems after launch?",
    answer: "Yes. We offer hosting, maintenance and support for the systems and websites we build.",
    category: "general",
    order: 30,
  },
  {
    question: "How do I check if you cover my area for internet?",
    answer:
      "Use the coverage check form on the Internet page and we will confirm whether we can connect you.",
    category: "internet",
    order: 10,
  },
];

export const SEED_POST = {
  slug: "welcome-to-the-new-humsols-website",
  title: "[PLACEHOLDER] Welcome to the new HumSols website",
  excerpt: "[PLACEHOLDER: short introduction for the first blog post]",
  body: "[PLACEHOLDER: write the first article from the admin. Markdown is supported — **bold**, lists, links and headings.]",
  tags: ["news"],
  status: "draft" as const,
};
