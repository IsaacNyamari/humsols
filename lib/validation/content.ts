import { z } from "zod";
import { ROLES } from "@/lib/constants";

// Admin content schemas. Used by the admin forms (client) and server actions.

const text = (max: number) => z.string().trim().max(max);
const required = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max);
const order = z.number().int().min(0).max(10000).default(0);
const stringList = (maxItems = 50, maxLen = 300) =>
  z
    .array(z.string().trim().max(maxLen))
    .max(maxItems)
    .default([])
    .transform((items) => items.filter(Boolean));

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens");

export const imageSchema = z.object({
  url: z.string().trim().min(1, "Upload an image"),
  alt: z.string().trim().min(3, "Alt text is required for every image").max(300),
});

/** An image field that may be empty (the form sends null). */
export const optionalImage = imageSchema.nullable().optional();

const optionalUrl = z
  .union([z.url("Enter a full URL including https://"), z.literal("")])
  .optional()
  .transform((v) => v || undefined);

export const seoInput = z
  .object({
    title: text(120).optional(),
    description: text(300).optional(),
    ogImage: text(500).optional(),
  })
  .default({});

export const serviceInput = z.object({
  slug: slugSchema,
  title: required("Title", 120),
  summary: required("Summary", 500),
  body: text(50000).default(""),
  icon: text(40).default("code"),
  heroImage: optionalImage,
  features: stringList(),
  process: z
    .array(
      z.object({
        step: z.number().int().min(1).max(50),
        title: required("Step title", 120),
        text: text(1000),
      }),
    )
    .max(20)
    .default([]),
  faqs: z
    .array(z.object({ q: required("Question", 300), a: required("Answer", 4000) }))
    .max(40)
    .default([]),
  order,
  published: z.boolean().default(false),
  seo: seoInput,
});

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id");

export const projectInput = z.object({
  slug: slugSchema,
  title: required("Title", 160),
  client: text(160).default(""),
  services: z.array(objectId).max(10).default([]),
  summary: text(600).default(""),
  body: text(50000).default(""),
  images: z.array(imageSchema).max(20).default([]),
  results: z
    .array(z.object({ label: required("Result label", 80), value: required("Result value", 80) }))
    .max(10)
    .default([]),
  liveUrl: optionalUrl,
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  order,
});

export const packageInput = z.object({
  name: required("Name", 80),
  audience: z.enum(["home", "business"]),
  speedMbps: z.number({ error: "Enter the speed" }).int().min(1).max(100000),
  priceKes: z.number({ error: "Enter the monthly price" }).int().min(0).max(10_000_000),
  installationFeeKes: z.number().int().min(0).max(10_000_000).default(0),
  features: stringList(),
  fairUse: text(1000).default(""),
  popular: z.boolean().default(false),
  active: z.boolean().default(true),
  order,
});

export const testimonialInput = z.object({
  name: required("Name", 120),
  role: text(120).default(""),
  company: text(120).default(""),
  quote: required("Quote", 1000),
  rating: z.number().int().min(1).max(5).default(5),
  isPlaceholder: z.boolean().default(false),
  published: z.boolean().default(false),
  order,
});

export const teamInput = z.object({
  name: required("Name", 120),
  role: text(120).default(""),
  bio: text(2000).default(""),
  photo: optionalImage,
  order,
  published: z.boolean().default(false),
});

export const postInput = z.object({
  slug: slugSchema,
  title: required("Title", 200),
  excerpt: text(500).default(""),
  body: text(100000).default(""),
  coverImage: optionalImage,
  tags: stringList(20, 40),
  status: z.enum(["draft", "published"]).default("draft"),
  publishedAt: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}/), z.literal("")])
    .optional()
    .transform((v) => v || undefined),
});

export const jobInput = z.object({
  slug: slugSchema,
  title: required("Title", 160),
  type: text(60).default("Full-time"),
  location: text(120).default("Nairobi, Kenya"),
  description: text(20000).default(""),
  open: z.boolean().default(true),
});

export const faqInput = z.object({
  question: required("Question", 300),
  answer: required("Answer", 4000),
  category: text(60).default("general"),
  order,
  published: z.boolean().default(true),
});

/** Accept a bare verification code or the whole <meta ... content="..."> tag. */
const verificationCode = z
  .string()
  .trim()
  .max(500)
  .default("")
  .transform((value) => value.match(/content=["']([^"']+)["']/i)?.[1] ?? value)
  .pipe(z.string().regex(/^[\w.-]*$/, "Paste only the code (letters, numbers, - and _)"));

export const settingsInput = z.object({
  companyName: required("Company name", 120),
  shortName: text(40).default("HumSols"),
  tagline: text(120).default(""),
  phones: stringList(5, 40),
  email: z.email("Enter a valid email address"),
  whatsapp: text(20).default(""),
  address: text(300).default(""),
  hours: text(300).default(""),
  mapEmbedUrl: z
    .union([
      z.url().startsWith("https://www.google.com/maps", "Use a Google Maps embed URL"),
      z.literal(""),
    ])
    .default(""),
  social: z
    .array(z.object({ label: required("Label", 40), url: z.url("Enter a full URL") }))
    .max(10)
    .default([]),
  seo: z.object({
    title: text(120).default(""),
    description: text(300).default(""),
    ogImage: text(500).optional(),
  }),
  announcement: z.object({
    text: text(200).default(""),
    href: text(300).optional(),
    active: z.boolean().default(false),
  }),
  verification: z
    .object({ google: verificationCode, bing: verificationCode })
    .default({ google: "", bing: "" }),
  notificationRecipients: z
    .array(z.email("Enter valid email addresses"))
    .min(1, "Add at least one recipient")
    .max(10),
});

// ------------------------------------------------------------ users & auth
export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(200)
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

export const loginInput = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Enter your password").max(200),
});

export const inviteUserInput = z.object({
  name: required("Name", 120),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  role: z.enum(ROLES),
});

export const changePasswordInput = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export const resetPasswordInput = z
  .object({ token: z.string().min(20), newPassword: passwordSchema, confirm: z.string() })
  .refine((v) => v.newPassword === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export type ServiceInput = z.infer<typeof serviceInput>;
export type ProjectInput = z.infer<typeof projectInput>;
export type PackageInput = z.infer<typeof packageInput>;
export type TestimonialInput = z.infer<typeof testimonialInput>;
export type TeamInput = z.infer<typeof teamInput>;
export type PostInput = z.infer<typeof postInput>;
export type JobInput = z.infer<typeof jobInput>;
export type FaqInput = z.infer<typeof faqInput>;
export type SettingsInput = z.infer<typeof settingsInput>;
