export const ROLES = ["owner", "admin", "editor", "sales"] as const;
export type Role = (typeof ROLES)[number];

export const LEAD_TYPES = [
  "contact",
  "quote",
  "internet_coverage",
  "internet_installation",
  "cctv_survey",
  "support",
] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  contact: "Contact",
  quote: "Quote request",
  internet_coverage: "Internet coverage check",
  internet_installation: "Internet installation",
  cctv_survey: "CCTV site survey",
  support: "Support request",
};

/** Short codes used in human-readable lead references, e.g. HS-Q-2026-0001. */
export const LEAD_TYPE_CODES: Record<LeadType, string> = {
  contact: "C",
  quote: "Q",
  internet_coverage: "IC",
  internet_installation: "II",
  cctv_survey: "CS",
  support: "S",
};

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
  "closed",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const SERVICE_SLUGS = [
  "web-applications",
  "custom-software",
  "billing-systems",
  "websites",
  "cctv-installation",
  "internet",
] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

/** Short names used in forms, menus and filters (titles in the DB may be longer). */
export const SERVICE_NAMES: Record<ServiceSlug, string> = {
  "web-applications": "Web applications",
  "custom-software": "Custom software",
  "billing-systems": "Billing & management systems",
  websites: "Websites",
  "cctv-installation": "CCTV installation",
  internet: "Internet (ISP)",
};

/** Cache tags for public content; admin mutations invalidate these. */
export const TAGS = {
  settings: "settings",
  services: "services",
  projects: "projects",
  packages: "packages",
  testimonials: "testimonials",
  team: "team",
  posts: "posts",
  jobs: "jobs",
  faqs: "faqs",
  pages: "pages",
} as const;

export const HS_WATER_BILLING_URL = "https://water-billing.humsols.com";
// [PLACEHOLDER] Confirm the exact request-access path on the HS Water Billing app.
export const HS_WATER_BILLING_REQUEST_ACCESS_URL = `${HS_WATER_BILLING_URL}/request-access`;
