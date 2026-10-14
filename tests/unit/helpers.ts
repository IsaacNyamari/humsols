import type { Role } from "@/lib/constants";
import type { Actor } from "@/lib/permissions";

export function actor(role: Role, id = "64b000000000000000000001"): Actor {
  return { id, name: `Test ${role}`, email: `${role}@example.test`, role };
}

export const base = {
  name: "Jane Wanjiku",
  email: "jane@example.test",
  phone: "+254 700 000 000",
  consent: true as const,
};

export const validSubmissions = {
  contact: { type: "contact", ...base, message: "Hello, I would like to talk about a website." },
  quote: {
    type: "quote",
    ...base,
    details: {
      services: ["cctv-installation"],
      cctv: {
        cameras: 8,
        placement: "both",
        siteType: "office",
        remoteViewing: true,
        location: "Westlands",
      },
    },
  },
  internet_coverage: {
    type: "internet_coverage",
    ...base,
    details: { area: "Kilimani", audience: "home" },
  },
  internet_installation: {
    type: "internet_installation",
    ...base,
    details: { audience: "business", area: "Westlands", address: "Some Plaza, 3rd floor" },
  },
  cctv_survey: {
    type: "cctv_survey",
    ...base,
    details: {
      preferredDate: "2026-11-02",
      siteType: "estate",
      camerasEstimate: 12,
      location: "Kileleshwa",
    },
  },
  support: {
    type: "support",
    ...base,
    message: "Our internet has been down since this morning.",
    details: { category: "internet", priority: "high" },
  },
} as const;
