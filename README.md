# Human Solutions (HumSols) website

The public website and admin for **Human Solutions** — https://humsols.com.

- **Public site:** services, HS Water Billing, internet packages with coverage check, CCTV site-survey booking, portfolio, blog, careers, contact, multi-step quote, and support requests.
- **Admin (`/admin`):** leads pipeline with notes, assignment and CSV export; editing of **all** site content (services, projects, packages, testimonials, team, blog, jobs, FAQs, every page's text, settings); users and roles; audit log.

Stack: Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict), MongoDB + Mongoose 9, Tailwind CSS v4, Zod 4, Auth.js v5, Nodemailer, Vitest and Playwright.

## Requirements

- Node.js 22 or newer (production runs 22).
- MongoDB 7 or 8, running locally or reachable via `MONGODB_URI`.
  **`npm run build` reads published content from MongoDB, so the database must be running during the build as well as at runtime.**

## Local setup

```bash
npm install
cp .env.example .env.local      # then edit .env.local
npm run seed                     # creates settings, services, placeholders and the owner account
npm run dev                      # http://localhost:3000, admin at /admin
```

Minimum `.env.local` for development:

```
MONGODB_URI=mongodb://127.0.0.1:27017/humsols
AUTH_SECRET=<output of: npx auth secret>
AUTH_URL=http://localhost:3000
SITE_URL=http://localhost:3000
MAIL_DRIVER=log                  # print emails to the terminal instead of sending
SEED_OWNER_EMAIL=you@example.com
SEED_OWNER_PASSWORD=<at least 10 characters>
```

Every variable is documented in [.env.example](.env.example).

No MongoDB installed? Either install MongoDB Community, or run it in Docker:

```bash
docker run -d --name humsols-mongo -p 27017:27017 mongo:8
```

## Scripts

| Command                       | What it does                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| `npm run dev`                 | Development server                                                                            |
| `npm run build` / `npm start` | Production build / server (needs MongoDB)                                                     |
| `npm run seed`                | Idempotent seed: only inserts what's missing, never overwrites admin edits                    |
| `npm run typecheck`           | TypeScript, strict                                                                            |
| `npm run lint`                | ESLint                                                                                        |
| `npm run format`              | Prettier                                                                                      |
| `npm test`                    | Vitest unit + API tests (in-memory MongoDB, no setup needed)                                  |
| `npm run test:e2e`            | Playwright: starts an in-memory MongoDB, seeds it, builds into `.next-e2e`, runs on port 3100 |

The first `npm test` downloads a MongoDB binary for `mongodb-memory-server` (a few hundred MB, once).
For Playwright, install the browser once: `npx playwright install chromium`.

## How it fits together

```
app/
  (site)/…              public pages (cached; refreshed instantly when admin edits)
  admin/(auth)/…        login, forgotten password, reset/invite
  admin/(panel)/…       dashboard, leads, content, page text, settings, users, audit
  admin/actions/…       server actions — every one re-checks the user's role
  api/leads             POST public form submissions (validation, honeypot, rate limit, origin check)
  api/public/[resource] read-only JSON of published content
  api/admin/…           CSV export, image upload
  uploads/[...key]      serves uploaded images
components/             ui/ (Button, Card, Badge, Input, Select, Textarea, Modal, Toast, Tabs, Table), site/, forms/, admin/
lib/
  validation/           Zod schemas shared by browser and server
  services/             business logic (leads, content, users, settings, page text, audit)
  queries/ + data/      published-content reads (data/ adds `use cache` + tags)
  page-content/         registry of every editable piece of page text, with defaults
  mail/                 transport, branded templates, lead emails
  storage.ts            upload storage interface (local disk now, S3-ready)
models/                 Mongoose models
proxy.ts                admin gate (Next 16's replacement for middleware)
auth.ts                 Auth.js (credentials, JWT sessions)
```

**Caching.** Public reads use `"use cache"` with cache tags (`lib/data/public.ts`). Admin saves call `updateTag(...)`, so changes appear on the site immediately.

**Roles** (enforced in `lib/services/*` on every call, not just hidden in the UI):

| Role   | Can                                        |
| ------ | ------------------------------------------ |
| owner  | everything, including managing owners      |
| admin  | everything except creating/changing owners |
| editor | content and page text only                 |
| sales  | leads only                                 |

**Leads.** Every form posts to `/api/leads`, which validates with Zod, rejects the honeypot, rate-limits per IP (default 5 per 10 minutes), and saves the lead with a reference such as `HS-Q-2026-0001`. Emails (team notification and customer auto-reply) are sent after the response. A failed email never loses the lead: it's logged on the lead, flagged on the dashboard, and can be retried.

## Editing content

Everything visible on the public site is editable from the admin:

- **Page text:** headings, intros, home hero, "why us", HS Water Billing features, About story/mission/values, call-to-action band, footer tagline, privacy and terms.
- **Services, Projects, Internet packages, Testimonials, Team, Blog posts, Jobs, FAQs:** full create, edit, publish/unpublish, reorder and delete, with image upload (alt text required).
- **Settings:** company name, phones, email, WhatsApp, address, hours, map, social links, lead-notification recipients, SEO defaults, announcement bar.

Anything still marked `[PLACEHOLDER…]` shows a yellow **Placeholder** badge on the site until it's replaced.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md).
