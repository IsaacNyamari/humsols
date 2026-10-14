import {
  getFaqs,
  getJobs,
  getPackages,
  getPosts,
  getProjects,
  getServices,
  getTeam,
  getTestimonials,
} from "@/lib/data/public";

// Read-only JSON for published content, e.g. GET /api/public/services.
const RESOURCES = {
  services: () => getServices(),
  projects: () => getProjects(),
  packages: () => getPackages(),
  posts: () => getPosts(),
  jobs: () => getJobs(),
  faqs: () => getFaqs(),
  testimonials: () => getTestimonials(),
  team: () => getTeam(),
} as const;

export async function GET(_request: Request, { params }: RouteContext<"/api/public/[resource]">) {
  const { resource } = await params;
  if (!(resource in RESOURCES)) return Response.json({ error: "Not found" }, { status: 404 });
  const data = await RESOURCES[resource as keyof typeof RESOURCES]();
  return Response.json(
    { data },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
