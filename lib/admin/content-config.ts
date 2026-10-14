import type { z } from "zod";
import {
  faqInput,
  jobInput,
  packageInput,
  postInput,
  projectInput,
  serviceInput,
  teamInput,
  testimonialInput,
} from "@/lib/validation/content";

// Client-safe description of each admin content type: which fields the editor
// shows, list columns and defaults. Validation uses the same Zod schemas as the
// server actions.

export type FieldDef =
  | {
      type: "text" | "textarea" | "url" | "date";
      name: string;
      label: string;
      hint?: string;
      required?: boolean;
      wide?: boolean;
    }
  | { type: "markdown"; name: string; label: string; hint?: string }
  | { type: "slug"; name: string; label: string; from: string }
  | { type: "number"; name: string; label: string; hint?: string; required?: boolean }
  | { type: "boolean"; name: string; label: string; hint?: string }
  | { type: "select"; name: string; label: string; options: [string, string][] }
  | { type: "image"; name: string; label: string; hint?: string }
  | { type: "images"; name: string; label: string }
  | { type: "list"; name: string; label: string; hint?: string; placeholder?: string }
  | {
      type: "pairs";
      name: string;
      label: string;
      keys: [string, string];
      keyLabels: [string, string];
      long?: boolean;
    }
  | { type: "process"; name: string; label: string }
  | { type: "services"; name: string; label: string }
  | { type: "seo"; name: string; label: string };

export type KindConfig = {
  label: string;
  plural: string;
  description: string;
  titleField: string;
  schema: z.ZodType;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
  /** Column showing extra info in the list. */
  subtitle?: (doc: Record<string, unknown>) => string;
  publishedLabel: [on: string, off: string];
  ordered: boolean;
  publicPath?: (doc: Record<string, unknown>) => string | null;
};

const ICONS: [string, string][] = [
  ["app", "Application"],
  ["code", "Code"],
  ["receipt", "Receipt / billing"],
  ["globe", "Globe / website"],
  ["camera", "Camera"],
  ["wifi", "Wi-Fi"],
  ["shield", "Shield"],
  ["users", "People"],
];

export const KINDS: Record<string, KindConfig> = {
  services: {
    label: "Service",
    plural: "Services",
    description:
      "The six services shown across the site. Slugs are used in URLs — change them with care.",
    titleField: "title",
    schema: serviceInput,
    publishedLabel: ["Published", "Hidden"],
    ordered: true,
    publicPath: (d) => `/services/${d.slug}`,
    subtitle: (d) => `/services/${d.slug}`,
    defaults: {
      slug: "",
      title: "",
      summary: "",
      body: "",
      icon: "code",
      heroImage: null,
      features: [],
      process: [],
      faqs: [],
      order: 0,
      published: false,
      seo: {},
    },
    fields: [
      { type: "text", name: "title", label: "Title", required: true },
      { type: "slug", name: "slug", label: "Slug (URL)", from: "title" },
      {
        type: "textarea",
        name: "summary",
        label: "Summary",
        hint: "One or two sentences used on cards and in search results",
        required: true,
        wide: true,
      },
      { type: "select", name: "icon", label: "Icon", options: ICONS },
      { type: "number", name: "order", label: "Order", hint: "Lower numbers appear first" },
      { type: "markdown", name: "body", label: "Problem it solves (Markdown)" },
      { type: "image", name: "heroImage", label: "Hero image" },
      { type: "list", name: "features", label: "What's included", placeholder: "Feature" },
      { type: "process", name: "process", label: "Process steps" },
      {
        type: "pairs",
        name: "faqs",
        label: "FAQs",
        keys: ["q", "a"],
        keyLabels: ["Question", "Answer"],
        long: true,
      },
      { type: "seo", name: "seo", label: "Search engines (SEO)" },
      {
        type: "boolean",
        name: "published",
        label: "Published",
        hint: "Visible on the public site",
      },
    ],
  },
  projects: {
    label: "Project",
    plural: "Projects",
    description: "Portfolio case studies. Mark anything not yet confirmed with [PLACEHOLDER].",
    titleField: "title",
    schema: projectInput,
    publishedLabel: ["Published", "Hidden"],
    ordered: true,
    publicPath: (d) => `/portfolio/${d.slug}`,
    subtitle: (d) => String(d.client ?? ""),
    defaults: {
      slug: "",
      title: "",
      client: "",
      services: [],
      summary: "",
      body: "",
      images: [],
      results: [],
      liveUrl: "",
      featured: false,
      published: false,
      order: 0,
    },
    fields: [
      { type: "text", name: "title", label: "Title", required: true },
      { type: "slug", name: "slug", label: "Slug (URL)", from: "title" },
      { type: "text", name: "client", label: "Client" },
      { type: "url", name: "liveUrl", label: "Live URL" },
      { type: "services", name: "services", label: "Services" },
      { type: "textarea", name: "summary", label: "Summary", wide: true },
      { type: "markdown", name: "body", label: "Case study (Markdown)" },
      { type: "images", name: "images", label: "Images" },
      {
        type: "pairs",
        name: "results",
        label: "Results",
        keys: ["label", "value"],
        keyLabels: ["Label", "Value"],
      },
      { type: "number", name: "order", label: "Order" },
      { type: "boolean", name: "featured", label: "Featured on the home page" },
      { type: "boolean", name: "published", label: "Published" },
    ],
  },
  packages: {
    label: "Internet package",
    plural: "Internet packages",
    description: "Packages on the Internet page. Prices are per month in KES.",
    titleField: "name",
    schema: packageInput,
    publishedLabel: ["Active", "Inactive"],
    ordered: true,
    publicPath: () => "/internet",
    subtitle: (d) =>
      `${d.audience} · ${d.speedMbps} Mbps · KES ${Number(d.priceKes).toLocaleString("en-KE")}/mo`,
    defaults: {
      name: "",
      audience: "home",
      speedMbps: 10,
      priceKes: 0,
      installationFeeKes: 0,
      features: [],
      fairUse: "",
      popular: false,
      active: true,
      order: 0,
    },
    fields: [
      { type: "text", name: "name", label: "Name", required: true },
      {
        type: "select",
        name: "audience",
        label: "For",
        options: [
          ["home", "Home"],
          ["business", "Business"],
        ],
      },
      { type: "number", name: "speedMbps", label: "Speed (Mbps)", required: true },
      { type: "number", name: "priceKes", label: "Price per month (KES)", required: true },
      {
        type: "number",
        name: "installationFeeKes",
        label: "Installation fee (KES)",
        hint: "0 shows as Free",
      },
      { type: "number", name: "order", label: "Order" },
      { type: "list", name: "features", label: "Features", placeholder: "Feature" },
      { type: "textarea", name: "fairUse", label: "Fair-use notes", wide: true },
      { type: "boolean", name: "popular", label: "Highlight as most popular" },
      { type: "boolean", name: "active", label: "Active (shown on the site)" },
    ],
  },
  testimonials: {
    label: "Testimonial",
    plural: "Testimonials",
    description: "Only publish real testimonials, used with the customer's permission.",
    titleField: "name",
    schema: testimonialInput,
    publishedLabel: ["Published", "Hidden"],
    ordered: true,
    publicPath: () => "/",
    subtitle: (d) => [d.role, d.company].filter(Boolean).join(", "),
    defaults: {
      name: "",
      role: "",
      company: "",
      quote: "",
      rating: 5,
      isPlaceholder: false,
      published: false,
      order: 0,
    },
    fields: [
      { type: "text", name: "name", label: "Customer name", required: true },
      { type: "text", name: "role", label: "Role" },
      { type: "text", name: "company", label: "Company" },
      {
        type: "select",
        name: "rating",
        label: "Rating",
        options: [
          ["5", "5 stars"],
          ["4", "4 stars"],
          ["3", "3 stars"],
          ["2", "2 stars"],
          ["1", "1 star"],
        ],
      },
      { type: "textarea", name: "quote", label: "Quote", required: true, wide: true },
      { type: "number", name: "order", label: "Order" },
      {
        type: "boolean",
        name: "isPlaceholder",
        label: "Placeholder",
        hint: "Shows a Placeholder badge on the site",
      },
      { type: "boolean", name: "published", label: "Published" },
    ],
  },
  team: {
    label: "Team member",
    plural: "Team",
    description: "People shown on the About page.",
    titleField: "name",
    schema: teamInput,
    publishedLabel: ["Published", "Hidden"],
    ordered: true,
    publicPath: () => "/about",
    subtitle: (d) => String(d.role ?? ""),
    defaults: { name: "", role: "", bio: "", photo: null, order: 0, published: false },
    fields: [
      { type: "text", name: "name", label: "Name", required: true },
      { type: "text", name: "role", label: "Role" },
      { type: "textarea", name: "bio", label: "Short bio", wide: true },
      { type: "image", name: "photo", label: "Photo" },
      { type: "number", name: "order", label: "Order" },
      { type: "boolean", name: "published", label: "Published" },
    ],
  },
  posts: {
    label: "Blog post",
    plural: "Blog posts",
    description: "Articles for the blog. Markdown is supported; raw HTML is not rendered.",
    titleField: "title",
    schema: postInput,
    publishedLabel: ["Published", "Draft"],
    ordered: false,
    publicPath: (d) => `/blog/${d.slug}`,
    subtitle: (d) =>
      d.publishedAt ? `Published ${String(d.publishedAt).slice(0, 10)}` : "Not published",
    defaults: {
      slug: "",
      title: "",
      excerpt: "",
      body: "",
      coverImage: null,
      tags: [],
      status: "draft",
      publishedAt: "",
    },
    fields: [
      { type: "text", name: "title", label: "Title", required: true },
      { type: "slug", name: "slug", label: "Slug (URL)", from: "title" },
      { type: "textarea", name: "excerpt", label: "Excerpt", wide: true },
      { type: "markdown", name: "body", label: "Article (Markdown)" },
      { type: "image", name: "coverImage", label: "Cover image" },
      { type: "list", name: "tags", label: "Tags", placeholder: "Tag" },
      {
        type: "select",
        name: "status",
        label: "Status",
        options: [
          ["draft", "Draft"],
          ["published", "Published"],
        ],
      },
      {
        type: "date",
        name: "publishedAt",
        label: "Publish date",
        hint: "Defaults to now when published",
      },
    ],
  },
  jobs: {
    label: "Job",
    plural: "Jobs",
    description: "Open roles on the Careers page. Close a role to hide it.",
    titleField: "title",
    schema: jobInput,
    publishedLabel: ["Open", "Closed"],
    ordered: false,
    publicPath: (d) => `/careers#${d.slug}`,
    subtitle: (d) => `${d.type} · ${d.location}`,
    defaults: {
      slug: "",
      title: "",
      type: "Full-time",
      location: "Nairobi, Kenya",
      description: "",
      open: true,
    },
    fields: [
      { type: "text", name: "title", label: "Title", required: true },
      { type: "slug", name: "slug", label: "Slug", from: "title" },
      { type: "text", name: "type", label: "Type", hint: "e.g. Full-time, Contract, Internship" },
      { type: "text", name: "location", label: "Location" },
      { type: "markdown", name: "description", label: "Description (Markdown)" },
      { type: "boolean", name: "open", label: "Open (shown on the site)" },
    ],
  },
  faqs: {
    label: "FAQ",
    plural: "FAQs",
    description:
      "General FAQs. Category “internet” also shows on the Internet page. Service-specific FAQs are edited on each service.",
    titleField: "question",
    schema: faqInput,
    publishedLabel: ["Published", "Hidden"],
    ordered: true,
    subtitle: (d) => String(d.category ?? ""),
    defaults: { question: "", answer: "", category: "general", order: 0, published: true },
    fields: [
      { type: "text", name: "question", label: "Question", required: true, wide: true },
      { type: "textarea", name: "answer", label: "Answer", required: true, wide: true },
      { type: "text", name: "category", label: "Category" },
      { type: "number", name: "order", label: "Order" },
      { type: "boolean", name: "published", label: "Published" },
    ],
  },
};

export function kindConfig(kind: string): KindConfig | null {
  return KINDS[kind] ?? null;
}
