import { connectDB } from "@/lib/db";
import type { Role } from "@/lib/constants";
import { DEFAULT_SETTINGS } from "@/lib/services/settings";
import { hashPassword } from "@/lib/services/users";
import {
  Faq,
  InternetPackage,
  Post,
  Project,
  Service,
  SiteSetting,
  TeamMember,
  Testimonial,
  User,
} from "@/models";
import {
  SEED_FAQS,
  SEED_PACKAGES,
  SEED_POST,
  SEED_PROJECTS,
  SEED_SERVICES,
  SEED_TEAM,
  SEED_TESTIMONIALS,
} from "./data";

export type SeedUser = { name: string; email: string; password: string; role: Role };

/**
 * Idempotent: inserts what is missing and never overwrites content edited in the
 * admin. Collections that already contain documents are left alone.
 */
export async function seed({
  users,
  log = console.log,
}: {
  users: SeedUser[];
  log?: (msg: string) => void;
}) {
  await connectDB();

  if (!(await SiteSetting.exists({ key: "site" }))) {
    await SiteSetting.create({ ...DEFAULT_SETTINGS, key: "site" });
    log("settings: created");
  } else log("settings: exists, skipped");

  for (const [i, s] of SEED_SERVICES.entries()) {
    const res = await Service.updateOne(
      { slug: s.slug },
      {
        $setOnInsert: {
          ...s,
          order: (i + 1) * 10,
          published: true,
          seo: { title: s.title, description: s.summary },
        },
      },
      { upsert: true },
    );
    log(`service ${s.slug}: ${res.upsertedCount ? "created" : "exists"}`);
  }

  if ((await InternetPackage.estimatedDocumentCount()) === 0) {
    await InternetPackage.insertMany(SEED_PACKAGES);
    log(`internet packages: ${SEED_PACKAGES.length} placeholders created`);
  }

  if ((await Project.estimatedDocumentCount()) === 0) {
    const services = await Service.find({}, { slug: 1 }).lean();
    const idBySlug = new Map(services.map((s) => [s.slug, s._id]));
    await Project.insertMany(
      SEED_PROJECTS.map(({ serviceSlugs, ...p }, i) => ({
        ...p,
        services: serviceSlugs.map((slug) => idBySlug.get(slug)).filter(Boolean),
        order: (i + 1) * 10,
      })),
    );
    log(`projects: ${SEED_PROJECTS.length} created (placeholders marked)`);
  }

  if ((await Testimonial.estimatedDocumentCount()) === 0) {
    await Testimonial.insertMany(SEED_TESTIMONIALS);
    log("testimonials: placeholders created");
  }
  if ((await TeamMember.estimatedDocumentCount()) === 0) {
    await TeamMember.insertMany(SEED_TEAM);
    log("team: placeholders created");
  }
  if ((await Faq.estimatedDocumentCount()) === 0) {
    await Faq.insertMany(SEED_FAQS.map((f) => ({ ...f, published: true })));
    log("faqs: created");
  }

  for (const u of users) {
    const exists = await User.exists({ email: u.email.toLowerCase() });
    if (exists) {
      log(`user ${u.email}: exists, skipped (password unchanged)`);
      continue;
    }
    await User.create({
      name: u.name,
      email: u.email,
      role: u.role,
      active: true,
      passwordHash: await hashPassword(u.password),
    });
    log(`user ${u.email} (${u.role}): created`);
  }

  if ((await Post.estimatedDocumentCount()) === 0) {
    const owner = await User.findOne({ role: "owner" }, { _id: 1 }).lean();
    await Post.create({ ...SEED_POST, author: owner?._id });
    log("blog: placeholder draft created");
  }
}
