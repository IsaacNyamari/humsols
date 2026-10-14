import { connectDB } from "@/lib/db";
import type {
  FaqDTO,
  JobDTO,
  PackageDTO,
  PostDTO,
  ProjectDTO,
  ServiceDTO,
  TeamMemberDTO,
  TestimonialDTO,
} from "@/lib/types";
import { toPlain } from "@/lib/utils";
import {
  Faq,
  InternetPackage,
  Job,
  Post,
  Project,
  Service,
  TeamMember,
  Testimonial,
} from "@/models";

// Plain database reads for the public site. Only published content is returned.
// No Next.js imports here so these can be unit tested; lib/data/public.ts wraps
// them with `use cache` and cache tags.

function plainWithId<T>(doc: unknown): T {
  const { _id, ...rest } = toPlain<Record<string, unknown> & { _id: string }>(doc);
  return { ...rest, id: _id } as T;
}

type PopulatedService = { _id: string; slug: string; title: string };

function projectDTO(doc: unknown): ProjectDTO {
  const p = plainWithId<Omit<ProjectDTO, "services"> & { services: unknown[] }>(doc);
  return {
    ...p,
    services: (p.services ?? [])
      .filter((s): s is PopulatedService => typeof s === "object" && s !== null && "slug" in s)
      .map((s) => ({ id: String(s._id), slug: s.slug, title: s.title })),
  };
}

export async function queryServices(): Promise<ServiceDTO[]> {
  await connectDB();
  const docs = await Service.find({ published: true }).sort({ order: 1 }).lean();
  return docs.map((d) => plainWithId<ServiceDTO>(d));
}

export async function queryService(slug: string): Promise<ServiceDTO | null> {
  await connectDB();
  const doc = await Service.findOne({ slug, published: true }).lean();
  return doc ? plainWithId<ServiceDTO>(doc) : null;
}

export async function queryProjects(
  options: { serviceSlug?: string; featured?: boolean; limit?: number } = {},
) {
  await connectDB();
  const filter: Record<string, unknown> = { published: true };
  if (options.featured) filter.featured = true;
  if (options.serviceSlug) {
    const service = await Service.findOne({ slug: options.serviceSlug }, { _id: 1 }).lean();
    if (!service) return [];
    filter.services = service._id;
  }
  let q = Project.find(filter)
    .sort({ order: 1, createdAt: -1 })
    .populate("services", "slug title published");
  if (options.limit) q = q.limit(options.limit);
  return (await q.lean()).map(projectDTO);
}

export async function queryProject(slug: string): Promise<ProjectDTO | null> {
  await connectDB();
  const doc = await Project.findOne({ slug, published: true })
    .populate("services", "slug title")
    .lean();
  return doc ? projectDTO(doc) : null;
}

export async function queryPackages(): Promise<PackageDTO[]> {
  await connectDB();
  const docs = await InternetPackage.find({ active: true })
    .sort({ audience: 1, order: 1, speedMbps: 1 })
    .lean();
  return docs.map((d) => plainWithId<PackageDTO>(d));
}

export async function queryTestimonials(): Promise<TestimonialDTO[]> {
  await connectDB();
  const docs = await Testimonial.find({ published: true }).sort({ order: 1 }).lean();
  return docs.map((d) => plainWithId<TestimonialDTO>(d));
}

export async function queryTeam(): Promise<TeamMemberDTO[]> {
  await connectDB();
  const docs = await TeamMember.find({ published: true }).sort({ order: 1 }).lean();
  return docs.map((d) => plainWithId<TeamMemberDTO>(d));
}

function postDTO(doc: unknown): PostDTO {
  const p = plainWithId<PostDTO & { author?: { name?: string } | string }>(doc);
  const { author, ...rest } = p;
  return { ...rest, authorName: typeof author === "object" ? author?.name : undefined };
}

export async function queryPosts(limit?: number): Promise<PostDTO[]> {
  await connectDB();
  let q = Post.find({ status: "published" }).sort({ publishedAt: -1 }).populate("author", "name");
  if (limit) q = q.limit(limit);
  return (await q.lean()).map(postDTO);
}

export async function queryPost(slug: string): Promise<PostDTO | null> {
  await connectDB();
  const doc = await Post.findOne({ slug, status: "published" }).populate("author", "name").lean();
  return doc ? postDTO(doc) : null;
}

export async function queryJobs(): Promise<JobDTO[]> {
  await connectDB();
  const docs = await Job.find({ open: true }).sort({ createdAt: -1 }).lean();
  return docs.map((d) => plainWithId<JobDTO>(d));
}

export async function queryFaqs(category?: string): Promise<FaqDTO[]> {
  await connectDB();
  const docs = await Faq.find({ published: true, ...(category ? { category } : {}) })
    .sort({ category: 1, order: 1 })
    .lean();
  return docs.map((d) => plainWithId<FaqDTO>(d));
}
