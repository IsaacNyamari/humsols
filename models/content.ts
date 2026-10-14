import { Schema, type Types } from "mongoose";
import { getModel, imageSchema, seoSchema, type ImageRef, type Seo } from "./_helpers";

// ---------------------------------------------------------------- Service
export interface IService {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  summary: string;
  body: string;
  icon: string;
  heroImage?: ImageRef;
  features: string[];
  process: { step: number; title: string; text: string }[];
  faqs: { q: string; a: string }[];
  order: number;
  published: boolean;
  seo?: Seo;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    summary: { type: String, required: true, maxlength: 500 },
    body: { type: String, default: "" },
    icon: { type: String, default: "code" },
    heroImage: imageSchema,
    features: { type: [String], default: [] },
    process: {
      type: [new Schema({ step: Number, title: String, text: String }, { _id: false })],
      default: [],
    },
    faqs: { type: [new Schema({ q: String, a: String }, { _id: false })], default: [] },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
    seo: seoSchema,
  },
  { timestamps: true },
);
serviceSchema.index({ published: 1, order: 1 });
export const Service = getModel<IService>("Service", serviceSchema);

// ---------------------------------------------------------------- Project
export interface IProject {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  client: string;
  services: Types.ObjectId[];
  summary: string;
  body: string;
  images: ImageRef[];
  results: { label: string; value: string }[];
  liveUrl?: string;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    client: { type: String, default: "", maxlength: 160 },
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    summary: { type: String, default: "", maxlength: 600 },
    body: { type: String, default: "" },
    images: { type: [imageSchema], default: [] },
    results: {
      type: [new Schema({ label: String, value: String }, { _id: false })],
      default: [],
    },
    liveUrl: String,
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
projectSchema.index({ published: 1, featured: 1, order: 1 });
projectSchema.index({ services: 1 });
export const Project = getModel<IProject>("Project", projectSchema);

// ---------------------------------------------------------------- InternetPackage
export interface IInternetPackage {
  _id: Types.ObjectId;
  name: string;
  audience: "home" | "business";
  speedMbps: number;
  priceKes: number;
  installationFeeKes: number;
  features: string[];
  fairUse: string;
  popular: boolean;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IInternetPackage>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    audience: { type: String, enum: ["home", "business"], required: true },
    speedMbps: { type: Number, required: true, min: 1 },
    priceKes: { type: Number, required: true, min: 0 },
    installationFeeKes: { type: Number, default: 0, min: 0 },
    features: { type: [String], default: [] },
    fairUse: { type: String, default: "" },
    popular: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
packageSchema.index({ active: 1, audience: 1, order: 1 });
export const InternetPackage = getModel<IInternetPackage>("InternetPackage", packageSchema);

// ---------------------------------------------------------------- Testimonial
export interface ITestimonial {
  _id: Types.ObjectId;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  isPlaceholder: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, maxlength: 120 },
    role: { type: String, default: "", maxlength: 120 },
    company: { type: String, default: "", maxlength: 120 },
    quote: { type: String, required: true, maxlength: 1000 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isPlaceholder: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
testimonialSchema.index({ published: 1, order: 1 });
export const Testimonial = getModel<ITestimonial>("Testimonial", testimonialSchema);

// ---------------------------------------------------------------- TeamMember
export interface ITeamMember {
  _id: Types.ObjectId;
  name: string;
  role: string;
  bio: string;
  photo?: ImageRef;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, maxlength: 120 },
    role: { type: String, default: "", maxlength: 120 },
    bio: { type: String, default: "", maxlength: 2000 },
    photo: imageSchema,
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);
teamSchema.index({ published: 1, order: 1 });
export const TeamMember = getModel<ITeamMember>("TeamMember", teamSchema);

// ---------------------------------------------------------------- Post
export interface IPost {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage?: ImageRef;
  tags: string[];
  author?: Types.ObjectId;
  publishedAt?: Date;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, maxlength: 200 },
    excerpt: { type: String, default: "", maxlength: 500 },
    body: { type: String, default: "" },
    coverImage: imageSchema,
    tags: { type: [String], default: [] },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    publishedAt: Date,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true },
);
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });
export const Post = getModel<IPost>("Post", postSchema);

// ---------------------------------------------------------------- Job
export interface IJob {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  type: string;
  location: string;
  description: string;
  open: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, maxlength: 160 },
    type: { type: String, default: "Full-time", maxlength: 60 },
    location: { type: String, default: "Nairobi, Kenya", maxlength: 120 },
    description: { type: String, default: "" },
    open: { type: Boolean, default: true },
  },
  { timestamps: true },
);
jobSchema.index({ open: 1, createdAt: -1 });
export const Job = getModel<IJob>("Job", jobSchema);

// ---------------------------------------------------------------- FAQ
export interface IFaq {
  _id: Types.ObjectId;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true, maxlength: 300 },
    answer: { type: String, required: true, maxlength: 4000 },
    category: { type: String, default: "general", maxlength: 60 },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);
faqSchema.index({ category: 1, order: 1 });
export const Faq = getModel<IFaq>("FAQ", faqSchema);
