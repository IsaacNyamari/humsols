import { z } from "zod";
import { SERVICE_SLUGS } from "@/lib/constants";

// Shared between client forms and the /api/leads route handler.

const phone = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .max(20, "Enter a valid phone number")
  .regex(/^\+?[\d\s()-]{7,20}$/, "Enter a valid phone number, e.g. +254 7XX XXX XXX");

/** Optional free text: blank strings become undefined. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");

export const contactFields = {
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email("Enter a valid email address")),
  phone,
  company: optionalText(160),
  /** Must be ticked: the visitor agrees to the privacy notice. */
  consent: z.literal(true, "Please accept the privacy notice so we can contact you"),
  /** Honeypot. Humans never see this field; bots tend to fill it in. */
  website: z.string().max(200).optional(),
  sourcePage: z.string().max(300).optional(),
  utm: z.record(z.string(), z.string().max(200)).optional(),
};

export const SITE_TYPES = [
  "home",
  "office",
  "shop",
  "estate",
  "school",
  "church",
  "warehouse",
  "other",
] as const;
export const AUDIENCES = ["home", "business"] as const;

// ------------------------------------------------------------ service-specific quote answers
export const webAnswers = z.object({
  pages: z.enum(["1-5", "6-15", "16+", "not-sure"]),
  features: z.array(z.string().max(60)).max(20).default([]),
  deadline: optionalText(60),
  description: optionalText(2000),
});

export const softwareAnswers = z.object({
  problem: z.string().trim().min(10, "Tell us a little about what the system should do").max(3000),
  users: optionalText(60),
  integrations: z.array(z.string().max(60)).max(20).default([]),
  deadline: optionalText(60),
});

export const billingAnswers = z.object({
  systemType: z.enum(["water", "subscription", "invoicing", "pos", "inventory", "other"]),
  customers: optionalText(60),
  mpesa: z.boolean().default(true),
  notes: optionalText(2000),
});

export const cctvAnswers = z.object({
  cameras: z.number({ error: "Enter a number of cameras" }).int().min(1).max(500),
  placement: z.enum(["indoor", "outdoor", "both"]),
  siteType: z.enum(SITE_TYPES),
  remoteViewing: z.boolean().default(true),
  location: z.string().trim().min(2, "Enter the site location").max(200),
});

export const internetAnswers = z.object({
  location: z.string().trim().min(2, "Enter your estate or area").max(200),
  audience: z.enum(AUDIENCES),
  speedMbps: z.number().int().min(1).max(10000).optional(),
});

/** Which key in quote details holds the answers for each service slug. */
export const QUOTE_ANSWER_KEYS = {
  "web-applications": "web",
  websites: "website",
  "custom-software": "software",
  "billing-systems": "billing",
  "cctv-installation": "cctv",
  internet: "internet",
} as const satisfies Record<(typeof SERVICE_SLUGS)[number], string>;

export const quoteDetails = z
  .object({
    services: z.array(z.enum(SERVICE_SLUGS)).min(1, "Choose at least one service"),
    web: webAnswers.optional(),
    website: webAnswers.optional(),
    software: softwareAnswers.optional(),
    billing: billingAnswers.optional(),
    cctv: cctvAnswers.optional(),
    internet: internetAnswers.optional(),
    budget: optionalText(60),
    timeline: optionalText(60),
  })
  .superRefine((value, ctx) => {
    for (const slug of value.services) {
      const key = QUOTE_ANSWER_KEYS[slug];
      if (!value[key]) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "Please answer the questions for this service",
        });
      }
    }
  });

export const coverageDetails = z.object({
  area: z.string().trim().min(2, "Enter your estate or area").max(200),
  address: optionalText(300),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  audience: z.enum(AUDIENCES),
});

export const installationDetails = z.object({
  packageId: optionalText(40),
  packageName: optionalText(120),
  audience: z.enum(AUDIENCES),
  area: z.string().trim().min(2, "Enter your estate or area").max(200),
  address: z.string().trim().min(3, "Enter the installation address").max(300),
  preferredDate: z
    .union([isoDate, z.literal("")])
    .optional()
    .transform((v) => v || undefined),
});

export const cctvSurveyDetails = z.object({
  preferredDate: isoDate,
  siteType: z.enum(SITE_TYPES),
  camerasEstimate: z.number({ error: "Enter an estimate" }).int().min(1).max(500),
  location: z.string().trim().min(2, "Enter the site location").max(200),
});

export const SUPPORT_CATEGORIES = ["internet", "cctv", "software", "website", "other"] as const;
export const PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export const supportDetails = z.object({
  category: z.enum(SUPPORT_CATEGORIES),
  priority: z.enum(PRIORITIES),
  accountRef: optionalText(80),
});

// ------------------------------------------------------------ full submissions
export const contactLeadSchema = z.object({
  type: z.literal("contact"),
  ...contactFields,
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(5000),
  details: z.object({ subject: optionalText(160) }).default({ subject: undefined }),
});

export const quoteLeadSchema = z.object({
  type: z.literal("quote"),
  ...contactFields,
  message: optionalText(5000),
  details: quoteDetails,
});

export const coverageLeadSchema = z.object({
  type: z.literal("internet_coverage"),
  ...contactFields,
  message: optionalText(2000),
  details: coverageDetails,
});

export const installationLeadSchema = z.object({
  type: z.literal("internet_installation"),
  ...contactFields,
  message: optionalText(2000),
  details: installationDetails,
});

export const cctvSurveyLeadSchema = z.object({
  type: z.literal("cctv_survey"),
  ...contactFields,
  message: optionalText(2000),
  details: cctvSurveyDetails,
});

export const supportLeadSchema = z.object({
  type: z.literal("support"),
  ...contactFields,
  message: z.string().trim().min(10, "Describe the problem (at least 10 characters)").max(5000),
  details: supportDetails,
});

export const leadSubmissionSchema = z.discriminatedUnion("type", [
  contactLeadSchema,
  quoteLeadSchema,
  coverageLeadSchema,
  installationLeadSchema,
  cctvSurveyLeadSchema,
  supportLeadSchema,
]);

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;
export type LeadSubmissionInput = z.input<typeof leadSubmissionSchema>;

/** Field errors keyed by dotted path, e.g. { "details.area": "Enter your estate or area" }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
