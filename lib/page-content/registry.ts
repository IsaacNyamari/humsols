import { z } from "zod";

// Every piece of fixed page copy on the public site. Defaults are used until the
// text is edited in Admin > Page text. Client-safe (no database imports).

export type CopyItem = { icon: string; title: string; text: string };

export type CopyField =
  | { name: string; label: string; type: "text" | "textarea" | "markdown"; hint?: string }
  | { name: string; label: string; type: "list"; hint?: string }
  | { name: string; label: string; type: "items"; hint?: string };

type PageDef<D extends Record<string, unknown>> = {
  label: string;
  path: string;
  fields: CopyField[];
  defaults: D;
};

type SeoCopy = { seoTitle: string; seoDescription: string };

const SEO_FIELDS: CopyField[] = [
  {
    name: "seoTitle",
    label: "Google — page title",
    type: "text",
    hint: "Shown in Google results and the browser tab. Aim for under 60 characters.",
  },
  {
    name: "seoDescription",
    label: "Google — description",
    type: "textarea",
    hint: "Shown under the title in Google results. Aim for 120–160 characters.",
  },
];

function page<D extends Record<string, unknown>>(def: PageDef<D>): PageDef<D>;
function page<D extends Record<string, unknown>>(
  def: PageDef<D>,
  seo: [string, string],
): PageDef<D & SeoCopy>;
function page<D extends Record<string, unknown>>(def: PageDef<D>, seo?: [string, string]) {
  if (!seo) return def;
  return {
    ...def,
    fields: [...def.fields, ...SEO_FIELDS],
    defaults: { ...def.defaults, seoTitle: seo[0], seoDescription: seo[1] },
  };
}

const PRIVACY = `> This policy is a draft written for the website launch. Items marked **[LEGAL REVIEW]** must be checked by a qualified Kenyan advocate before publication.

## 1. Who we are

Human Solutions ("HumSols", "we", "us") is a technology company based in Westlands, Nairobi, Kenya. We are the data controller for personal data collected through humsols.com. Contact us at [info@humsols.com](mailto:info@humsols.com) or +254 725 742 737.

**[LEGAL REVIEW: registered company name, registration number and ODPC registration as a data controller/processor, if applicable]**

## 2. What we collect

- **Details you give us** in our forms: name, email address, phone number, company, location or address, and the information about your request (for example the number of cameras or the internet package you want).
- **Technical data** sent automatically by your browser: IP address and browser type, which we keep with form submissions to prevent spam and abuse.
- **Location**, only if you choose "Use my current location" on the coverage check. We do not track your location otherwise.
- **Analytics**, only if you allow it: anonymous page-visit statistics without advertising cookies.

## 3. Why we use it (lawful basis)

- To respond to your enquiry, prepare quotes, carry out site surveys and installations, and provide support — with your consent and to take steps at your request before entering into a contract.
- To send you the confirmation email and reference number for your request.
- To keep our website secure and prevent spam (legitimate interest).

We do not sell your personal data and we do not send you marketing messages unless you ask us to.

## 4. Who we share it with

Only our staff who handle your request, and service providers who help us run the website and email (for example hosting and email providers), under appropriate confidentiality and data protection terms.

**[LEGAL REVIEW: list processors and any transfers outside Kenya and the safeguards used (Part VI of the Act)]**

## 5. How long we keep it

We keep enquiries for as long as needed to respond and to maintain records of our dealings with you, then delete or anonymise them.

**[LEGAL REVIEW: confirm retention periods]**

## 6. Your rights

Under the Data Protection Act, 2019 you have the right to:

- be informed of how your data is used;
- access your personal data;
- object to processing;
- have inaccurate data corrected and false or misleading data deleted;
- withdraw consent at any time.

To exercise these rights, email [info@humsols.com](mailto:info@humsols.com). You may also complain to the Office of the Data Protection Commissioner (ODPC), www.odpc.go.ke.

## 7. Security

We protect your data with encrypted connections (HTTPS), access controls limited to authorised staff, and regular backups.

## 8. Changes

We may update this policy. The current version is always on this page.

**[LEGAL REVIEW: add "last updated" date on publication]**`;

const TERMS = `> Draft for launch. Items marked **[LEGAL REVIEW]** must be checked by a qualified Kenyan advocate.

## 1. About these terms

These terms apply to your use of humsols.com, operated by Human Solutions, Westlands, Nairobi, Kenya. By using the website you agree to them.

## 2. Information on this website

We aim to keep information accurate and up to date, but it is provided for general information only. Package descriptions, features and prices shown on the website are indicative and are confirmed in a written quote or agreement.

## 3. Quotes and orders

Submitting a form is a request for information or a quote, not a contract. A contract is formed only when we agree the scope, price (in KES) and terms with you in writing.

**[LEGAL REVIEW: validity period of quotes, deposits and payment terms]**

## 4. Internet services

Internet services are subject to coverage, a site check and a separate service agreement, including any fair-use policy. Advertised speeds are the maximum for each package.

**[LEGAL REVIEW: service level, fair-use and cancellation terms; applicable Communications Authority of Kenya requirements]**

## 5. CCTV installation

Site surveys are free and without obligation. Installation, equipment warranties and maintenance are set out in your quotation.

**[LEGAL REVIEW: equipment warranty terms]**

## 6. Software and websites

Ownership, licensing, hosting and support for software and websites are set out in the project agreement.

**[LEGAL REVIEW: default IP ownership and licensing position]**

## 7. Acceptable use

Do not misuse the website, submit false information, attempt to gain unauthorised access, or send spam through our forms.

## 8. Liability

**[LEGAL REVIEW: limitation of liability clause appropriate under Kenyan law, including the Consumer Protection Act, 2012]**

## 9. Governing law

These terms are governed by the laws of Kenya, and the courts of Kenya have jurisdiction.

## 10. Contact

Questions about these terms: [info@humsols.com](mailto:info@humsols.com), +254 725 742 737.`;

const header = (eyebrow: string, title: string, intro: string) => ({ eyebrow, title, intro });
const headerFields: CopyField[] = [
  { name: "eyebrow", label: "Small heading above the title", type: "text" },
  { name: "title", label: "Page title", type: "text" },
  { name: "intro", label: "Introduction", type: "textarea" },
];

export const PAGES = {
  home: page(
    {
      label: "Home page",
      path: "/",
      fields: [
        { name: "heroEyebrow", label: "Hero — small heading", type: "text" },
        {
          name: "heroTitle",
          label: "Hero — title",
          type: "text",
          hint: "The highlighted words below are added to the end in blue",
        },
        { name: "heroHighlight", label: "Hero — highlighted words", type: "text" },
        { name: "heroIntro", label: "Hero — introduction", type: "textarea" },
        { name: "heroCta", label: "Hero — main button", type: "text" },
        { name: "heroChip1", label: "Hero — floating label 1", type: "text" },
        { name: "heroChip2", label: "Hero — floating label 2", type: "text" },
        { name: "servicesEyebrow", label: "Services — small heading", type: "text" },
        { name: "servicesTitle", label: "Services — title", type: "text" },
        { name: "servicesIntro", label: "Services — introduction", type: "textarea" },
        { name: "whyEyebrow", label: "Why us — small heading", type: "text" },
        { name: "whyTitle", label: "Why us — title", type: "text" },
        { name: "reasons", label: "Why us — reasons", type: "items" },
        { name: "spotlightBadge", label: "HS Water Billing — badge", type: "text" },
        { name: "spotlightTitle", label: "HS Water Billing — title", type: "text" },
        { name: "spotlightText", label: "HS Water Billing — text", type: "textarea" },
        { name: "spotlightPoints", label: "HS Water Billing — points", type: "list" },
        { name: "projectsEyebrow", label: "Projects — small heading", type: "text" },
        { name: "projectsTitle", label: "Projects — title", type: "text" },
        { name: "internetEyebrow", label: "Internet — small heading", type: "text" },
        { name: "internetTitle", label: "Internet — title", type: "text" },
        { name: "internetIntro", label: "Internet — introduction", type: "textarea" },
        { name: "testimonialsEyebrow", label: "Testimonials — small heading", type: "text" },
        { name: "testimonialsTitle", label: "Testimonials — title", type: "text" },
      ],
      defaults: {
        heroEyebrow: "Human Solutions · Nairobi",
        heroTitle: "We build the systems your business",
        heroHighlight: "runs on.",
        heroIntro:
          "Web applications, custom software and billing systems — plus websites, CCTV and internet. One local team for the technology that keeps your business working.",
        heroCta: "Get a quote",
        heroChip1: "CCTV · view on your phone",
        heroChip2: "Home & business internet",
        servicesEyebrow: "What we do",
        servicesTitle: "Six services, one team",
        servicesIntro:
          "From the software that runs your operations to the cameras and internet that keep it secure and connected.",
        whyEyebrow: "Why HumSols",
        whyTitle: "Practical technology, properly supported",
        reasons: [
          {
            icon: "users",
            title: "One partner, end to end",
            text: "Software, websites, CCTV and internet from one team — fewer suppliers, one number to call.",
          },
          {
            icon: "pin",
            title: "Local, in Westlands",
            text: "A Nairobi team that can visit your site, meet your staff and support you in person.",
          },
          {
            icon: "receipt",
            title: "Clear prices in KES",
            text: "Written scopes and quotes in Kenya shillings before work starts. No surprises.",
          },
          {
            icon: "bolt",
            title: "Built for how Kenya pays",
            text: "M-Pesa, SMS and email built into the systems we deliver.",
          },
          {
            icon: "wrench",
            title: "Support after launch",
            text: "Hosting, maintenance and support contracts keep things running.",
          },
          {
            icon: "shield",
            title: "Secure by default",
            text: "Backups, access control and good security practice in everything we build.",
          },
        ] as CopyItem[],
        spotlightBadge: "Our product",
        spotlightTitle: "HS Water Billing",
        spotlightText:
          "Multi-tenant water billing and borehole project management for water vendors, estates, landlords and community water projects.",
        spotlightPoints: [
          "Water billing",
          "Borehole project management",
          "Multi-tenant accounts",
          "Runs in the browser",
        ],
        projectsEyebrow: "Our work",
        projectsTitle: "Featured projects",
        internetEyebrow: "Internet",
        internetTitle: "Fast, reliable internet for home and business",
        internetIntro:
          "Choose a package by speed. Check coverage for your estate and we'll handle the installation.",
        testimonialsEyebrow: "Customers",
        testimonialsTitle: "What our customers say",
      },
    },
    [
      "Human Solutions (HumSols) — Software, websites, CCTV and internet in Nairobi",
      "HumSols builds web applications, custom software, billing systems and websites, and installs CCTV and internet for businesses and homes in Kenya.",
    ],
  ),
  global: page({
    label: "Footer & call-to-action band",
    path: "/",
    fields: [
      { name: "footerTagline", label: "Footer — tagline", type: "textarea" },
      { name: "ctaTitle", label: "Call-to-action band — title", type: "text" },
      { name: "ctaText", label: "Call-to-action band — text", type: "textarea" },
      {
        name: "successText",
        label: "Form success message",
        type: "textarea",
        hint: "Shown after any form is submitted, below the reference number",
      },
    ],
    defaults: {
      footerTagline:
        "We build the systems your business runs on — and keep you secure and connected.",
      ctaTitle: "Let's talk about your project",
      ctaText: "Tell us what you need. We reply quickly with clear next steps and a price in KES.",
      successText:
        "We've emailed you a copy. Our team will contact you, usually within one working day. For anything urgent, call or WhatsApp us and quote your reference.",
    },
  }),
  services: page(
    {
      label: "Services overview",
      path: "/services",
      fields: [
        ...headerFields,
        { name: "ctaTitle", label: "Bottom band — title", type: "text" },
        { name: "ctaText", label: "Bottom band — text", type: "textarea" },
      ],
      defaults: {
        ...header(
          "Services",
          "Technology your business can rely on",
          "We build the software that runs your operations and install the cameras and internet that keep it secure and connected.",
        ),
        ctaTitle: "Not sure which service you need?",
        ctaText:
          "Tell us about the problem and we'll recommend the simplest solution — software, hardware or both.",
      },
    },
    [
      "Services",
      "Web applications, custom software, billing systems, websites, CCTV installation and internet — from one Nairobi team.",
    ],
  ),
  hsWaterBilling: page(
    {
      label: "HS Water Billing product page",
      path: "/products/hs-water-billing",
      fields: [
        ...headerFields,
        { name: "featuresEyebrow", label: "Features — small heading", type: "text" },
        { name: "featuresTitle", label: "Features — title", type: "text" },
        {
          name: "features",
          label: "Features",
          type: "items",
          hint: "Include [PLACEHOLDER] in a title to show a Placeholder badge",
        },
        { name: "audienceEyebrow", label: "Audience — small heading", type: "text" },
        { name: "audienceTitle", label: "Audience — title", type: "text" },
        { name: "audiences", label: "Who it's for", type: "list" },
        { name: "ctaTitle", label: "Bottom band — title", type: "text" },
        { name: "ctaText", label: "Bottom band — text", type: "textarea" },
      ],
      defaults: {
        ...header(
          "Our product",
          "HS Water Billing",
          "Multi-tenant water billing and borehole project management for water vendors, estates, landlords and community water projects.",
        ),
        featuresEyebrow: "Features",
        featuresTitle: "Everything you need to bill for water",
        features: [
          {
            icon: "receipt",
            title: "Water billing",
            text: "Record meter readings and produce accurate bills for every customer.",
          },
          {
            icon: "wrench",
            title: "Borehole projects",
            text: "Manage borehole projects alongside your billing in one place.",
          },
          {
            icon: "users",
            title: "Multi-tenant",
            text: "Each water vendor or estate gets its own separate, secure account.",
          },
          {
            icon: "bolt",
            title: "M-Pesa payments [PLACEHOLDER: confirm]",
            text: "Customers pay by M-Pesa and payments are matched to their accounts.",
          },
          {
            icon: "mail",
            title: "Bill notifications [PLACEHOLDER: confirm]",
            text: "Send bills and reminders to customers by SMS and email.",
          },
          {
            icon: "dashboard",
            title: "Reports [PLACEHOLDER: confirm]",
            text: "Statements, collections and arrears at a glance.",
          },
        ] as CopyItem[],
        audienceEyebrow: "Who it's for",
        audienceTitle: "Built for Kenyan water providers",
        audiences: [
          "Water vendors",
          "Estates & management companies",
          "Landlords",
          "Community & borehole projects",
        ],
        ctaTitle: "Want a walkthrough of HS Water Billing?",
        ctaText: "Call or WhatsApp us and we'll show you how it works for your water project.",
      },
    },
    [
      "HS Water Billing — water billing & borehole project management",
      "HS Water Billing is a multi-tenant platform for water billing and borehole project management. Built by Human Solutions.",
    ],
  ),
  internet: page(
    {
      label: "Internet page",
      path: "/internet",
      fields: [
        ...headerFields,
        { name: "packagesTitle", label: "Packages — title", type: "text" },
        { name: "packagesIntro", label: "Packages — introduction", type: "text" },
        { name: "coverageTitle", label: "Coverage — title", type: "text" },
        { name: "coverageIntro", label: "Coverage — introduction", type: "textarea" },
        { name: "installTitle", label: "Installation — title", type: "text" },
        { name: "faqTitle", label: "FAQ — title", type: "text" },
      ],
      defaults: {
        ...header(
          "Internet",
          "Fast, reliable internet for home and business",
          "Choose a package by speed, check whether we cover your estate, and we'll install and set up your Wi-Fi.",
        ),
        packagesTitle: "Pick your speed",
        packagesIntro: "All prices are per month in Kenya shillings (KES).",
        coverageTitle: "Do we cover your area?",
        coverageIntro:
          "Tell us your estate or area — or pin your location — and we'll confirm whether we can connect you.",
        installTitle: "Request installation",
        faqTitle: "Internet questions",
      },
    },
    [
      "Home & business internet",
      "Internet packages for homes and businesses in Nairobi, priced in KES. Check coverage for your area and request installation.",
    ],
  ),
  cctv: page(
    {
      label: "CCTV page",
      path: "/cctv",
      fields: [
        { name: "eyebrow", label: "Small heading", type: "text" },
        { name: "title", label: "Page title", type: "text" },
        { name: "includedTitle", label: "What you get — title", type: "text" },
        { name: "surveyTitle", label: "Survey form — title", type: "text" },
        { name: "surveyIntro", label: "Survey form — introduction", type: "textarea" },
      ],
      defaults: {
        eyebrow: "CCTV installation",
        title: "See what's happening at your site — from anywhere",
        includedTitle: "What you get",
        surveyTitle: "Book a free site survey",
        surveyIntro:
          "We'll visit, assess your site and recommend the right system — no obligation.",
      },
    },
    [
      "CCTV installation — book a free site survey",
      "CCTV installation in Nairobi: free site survey, IP and analog cameras, NVR/DVR setup, remote viewing on your phone and maintenance.",
    ],
  ),
  portfolio: page(
    {
      label: "Portfolio",
      path: "/portfolio",
      fields: headerFields,
      defaults: header(
        "Portfolio",
        "Our work",
        "A selection of systems we've built and sites we've secured and connected.",
      ),
    },
    [
      "Portfolio",
      "Projects and case studies from Human Solutions: software, billing systems, websites, CCTV and internet.",
    ],
  ),
  about: page(
    {
      label: "About page",
      path: "/about",
      fields: [
        ...headerFields,
        { name: "storyTitle", label: "Story — title", type: "text" },
        { name: "story", label: "Story", type: "markdown" },
        { name: "missionTitle", label: "Mission — title", type: "text" },
        { name: "mission", label: "Mission", type: "textarea" },
        { name: "valuesEyebrow", label: "Values — small heading", type: "text" },
        { name: "valuesTitle", label: "Values — title", type: "text" },
        { name: "values", label: "Values", type: "items" },
        { name: "teamEyebrow", label: "Team — small heading", type: "text" },
        { name: "teamTitle", label: "Team — title", type: "text" },
      ],
      defaults: {
        ...header(
          "About",
          "Human Solutions",
          "A Nairobi technology company in Westlands. We build the systems businesses run on, and keep them secure and connected.",
        ),
        storyTitle: "Our story",
        story: `Human Solutions — HumSols — helps small and medium businesses, estates and landlords, water vendors, schools, churches and homes across Kenya use technology that actually fits the way they work.

We build web applications, custom software and billing systems, including our own platform, HS Water Billing. We also design websites and install CCTV and internet, so our customers can deal with one team for their technology.

[PLACEHOLDER: founding year, founders and how the company started]`,
        missionTitle: "Our mission",
        mission:
          "To give every Kenyan business and home practical, reliable technology — and the people to support it.",
        valuesEyebrow: "Values",
        valuesTitle: "How we work",
        values: [
          {
            icon: "users",
            title: "People first",
            text: "Technology should make work easier for the people using it. We design around them.",
          },
          {
            icon: "check",
            title: "Practical",
            text: "The simplest solution that works, delivered on time and explained in plain language.",
          },
          {
            icon: "shield",
            title: "Dependable",
            text: "We stand behind what we deliver with support, maintenance and honest advice.",
          },
          {
            icon: "bolt",
            title: "Local",
            text: "Built for how Kenyan businesses work — including M-Pesa, SMS and on-site support.",
          },
        ] as CopyItem[],
        teamEyebrow: "Team",
        teamTitle: "The people behind HumSols",
      },
    },
    [
      "About us",
      "Human Solutions (HumSols) is a Nairobi technology company in Westlands building software and installing CCTV and internet.",
    ],
  ),
  blog: page(
    {
      label: "Blog",
      path: "/blog",
      fields: [
        ...headerFields,
        { name: "empty", label: "Text when there are no posts", type: "text" },
      ],
      defaults: {
        ...header("Blog", "News & articles", "Practical advice and updates from the HumSols team."),
        empty: "No articles yet — check back soon.",
      },
    },
    [
      "Blog",
      "News and practical articles from Human Solutions on software, billing, websites, CCTV and internet.",
    ],
  ),
  careers: page(
    {
      label: "Careers",
      path: "/careers",
      fields: [
        ...headerFields,
        { name: "emptyTitle", label: "No open roles — title", type: "text" },
        {
          name: "emptyText",
          label: "No open roles — text",
          type: "textarea",
          hint: "Followed by the company email address",
        },
      ],
      defaults: {
        ...header(
          "Careers",
          "Work with us",
          "We're a practical team that builds and supports technology for Kenyan businesses.",
        ),
        emptyTitle: "No open roles right now",
        emptyText: "We're always happy to hear from good people. Send your CV to",
      },
    },
    ["Careers", "Open roles at Human Solutions in Nairobi."],
  ),
  contact: page(
    {
      label: "Contact",
      path: "/contact",
      fields: [...headerFields, { name: "formTitle", label: "Form title", type: "text" }],
      defaults: {
        ...header(
          "Contact",
          "Talk to us",
          "Call, WhatsApp, email or send a message. We usually reply within one working day.",
        ),
        formTitle: "Send us a message",
      },
    },
    [
      "Contact us",
      "Call +254 725 742 737, WhatsApp or email info@humsols.com. Human Solutions, Westlands, Nairobi.",
    ],
  ),
  quote: page(
    {
      label: "Get a quote",
      path: "/quote",
      fields: headerFields,
      defaults: header(
        "Free quote",
        "Get a quote",
        "Answer a few quick questions — it takes about two minutes. We'll come back with clear next steps and a price in KES.",
      ),
    },
    [
      "Get a quote",
      "Request a free quote for software, billing systems, websites, CCTV or internet. Priced in KES.",
    ],
  ),
  support: page(
    {
      label: "Customer support",
      path: "/support",
      fields: [
        ...headerFields,
        { name: "urgentTitle", label: "Urgent box — title", type: "text" },
        { name: "urgentText", label: "Urgent box — text", type: "textarea" },
      ],
      defaults: {
        ...header(
          "Support",
          "Customer support",
          "For existing customers: tell us what's wrong and how urgent it is. You'll get a reference number straight away.",
        ),
        urgentTitle: "Urgent? Call us",
        urgentText:
          "If your internet, cameras or system is completely down, call or WhatsApp us after submitting and quote your reference.",
      },
    },
    [
      "Customer support",
      "Report an internet, CCTV, software or website issue to Human Solutions support.",
    ],
  ),
  privacy: page(
    {
      label: "Privacy policy",
      path: "/privacy",
      fields: [...headerFields, { name: "body", label: "Policy (Markdown)", type: "markdown" }],
      defaults: {
        ...header(
          "Legal",
          "Privacy policy",
          "How we handle your personal data, in line with the Kenya Data Protection Act, 2019.",
        ),
        body: PRIVACY,
      },
    },
    [
      "Privacy policy",
      "How Human Solutions collects, uses and protects personal data under the Kenya Data Protection Act, 2019.",
    ],
  ),
  terms: page(
    {
      label: "Terms of service",
      path: "/terms",
      fields: [...headerFields, { name: "body", label: "Terms (Markdown)", type: "markdown" }],
      defaults: {
        ...header(
          "Legal",
          "Terms of service",
          "The terms for using this website and requesting our services.",
        ),
        body: TERMS,
      },
    },
    [
      "Terms of service",
      "Terms for using the Human Solutions website and requesting quotes and services.",
    ],
  ),
};

export type PageKey = keyof typeof PAGES;
export type PageCopy<K extends PageKey> = (typeof PAGES)[K]["defaults"];
export const PAGE_KEYS = Object.keys(PAGES) as PageKey[];

export function isPageKey(value: string): value is PageKey {
  return value in PAGES;
}

const itemSchema = z.object({
  icon: z.string().max(40),
  title: z.string().trim().min(1, "Title is required").max(160),
  text: z.string().trim().max(1000),
});

/** Zod schema for one page's copy, derived from its field list. */
export function pageSchema(key: PageKey) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of PAGES[key].fields) {
    shape[f.name] =
      f.type === "text"
        ? z.string().trim().max(300)
        : f.type === "textarea"
          ? z.string().trim().max(3000)
          : f.type === "markdown"
            ? z.string().max(100000)
            : f.type === "list"
              ? z.array(z.string().trim().min(1, "Remove empty entries").max(200)).max(30)
              : z.array(itemSchema).max(30);
  }
  return z.object(shape);
}

export const COPY_ICONS = [
  "users",
  "pin",
  "receipt",
  "bolt",
  "wrench",
  "shield",
  "check",
  "mail",
  "dashboard",
  "app",
  "code",
  "globe",
  "camera",
  "wifi",
  "star",
  "clock",
  "phone",
];
