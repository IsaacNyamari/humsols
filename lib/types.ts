// Plain, serialisable shapes returned to pages (ObjectIds and Dates are strings).

export type Image = { url: string; alt: string };

export type ServiceDTO = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  icon: string;
  heroImage?: Image;
  features: string[];
  process: { step: number; title: string; text: string }[];
  faqs: { q: string; a: string }[];
  order: number;
  published: boolean;
  seo?: { title?: string; description?: string; ogImage?: string };
  updatedAt: string;
};

export type ProjectDTO = {
  id: string;
  slug: string;
  title: string;
  client: string;
  services: { id: string; slug: string; title: string }[];
  summary: string;
  body: string;
  images: Image[];
  results: { label: string; value: string }[];
  liveUrl?: string;
  featured: boolean;
  updatedAt: string;
};

export type PackageDTO = {
  id: string;
  name: string;
  audience: "home" | "business";
  speedMbps: number;
  priceKes: number;
  installationFeeKes: number;
  features: string[];
  fairUse: string;
  popular: boolean;
};

export type TestimonialDTO = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  isPlaceholder: boolean;
};

export type TeamMemberDTO = { id: string; name: string; role: string; bio: string; photo?: Image };

export type PostDTO = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage?: Image;
  tags: string[];
  authorName?: string;
  publishedAt?: string;
  updatedAt: string;
};

export type JobDTO = {
  id: string;
  slug: string;
  title: string;
  type: string;
  location: string;
  description: string;
  updatedAt: string;
};

export type FaqDTO = { id: string; question: string; answer: string; category: string };
