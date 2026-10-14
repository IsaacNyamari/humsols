import { cacheLife, cacheTag } from "next/cache";
import { TAGS } from "@/lib/constants";
import * as q from "@/lib/queries/public";
import type { PageKey } from "@/lib/page-content/registry";
import { readPageCopy } from "@/lib/services/page-content";
import { getSiteSettings } from "@/lib/services/settings";

// Cached reads for public pages. Content only changes through the admin, which
// expires these tags immediately (updateTag), so a long lifetime is safe.

export async function getSettings() {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.settings);
  return getSiteSettings();
}

export async function getServices() {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.services);
  return q.queryServices();
}

export async function getService(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.services, `${TAGS.services}:${slug}`);
  return q.queryService(slug);
}

export async function getProjects(
  options: { serviceSlug?: string; featured?: boolean; limit?: number } = {},
) {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.projects, TAGS.services);
  return q.queryProjects(options);
}

export async function getProject(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.projects, TAGS.services);
  return q.queryProject(slug);
}

export async function getPackages() {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.packages);
  return q.queryPackages();
}

export async function getTestimonials() {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.testimonials);
  return q.queryTestimonials();
}

export async function getTeam() {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.team);
  return q.queryTeam();
}

export async function getPosts(limit?: number) {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.posts);
  return q.queryPosts(limit);
}

export async function getPost(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.posts);
  return q.queryPost(slug);
}

export async function getJobs() {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.jobs);
  return q.queryJobs();
}

export async function getFaqs(category?: string) {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.faqs);
  return q.queryFaqs(category);
}

/** Editable page copy (Admin > Page text), with defaults for anything not yet edited. */
export async function getPageCopy<K extends PageKey>(key: K) {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.pages, `${TAGS.pages}:${key}`);
  return readPageCopy(key);
}
