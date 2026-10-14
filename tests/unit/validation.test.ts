import { describe, expect, it } from "vitest";
import { LEAD_TYPES } from "@/lib/constants";
import { leadSubmissionSchema } from "@/lib/validation/lead";
import { validSubmissions } from "./helpers";

describe("lead submission schemas", () => {
  it.each(LEAD_TYPES)("accepts a valid %s submission", (type) => {
    const result = leadSubmissionSchema.safeParse(validSubmissions[type]);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });

  it("normalises email and trims text", () => {
    const parsed = leadSubmissionSchema.parse({
      ...validSubmissions.contact,
      email: "  Jane@Example.TEST ",
      name: "  Jane ",
    });
    expect(parsed.email).toBe("jane@example.test");
    expect(parsed.name).toBe("Jane");
  });

  it("requires consent", () => {
    const result = leadSubmissionSchema.safeParse({ ...validSubmissions.contact, consent: false });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["consent"]);
  });

  it("rejects an invalid phone number and email", () => {
    const result = leadSubmissionSchema.safeParse({
      ...validSubmissions.contact,
      phone: "abc",
      email: "nope",
    });
    const paths = result.error?.issues.map((i) => i.path.join("."));
    expect(paths).toContain("phone");
    expect(paths).toContain("email");
  });

  it("requires service-specific answers for each chosen quote service", () => {
    const result = leadSubmissionSchema.safeParse({
      ...validSubmissions.quote,
      details: { ...validSubmissions.quote.details, services: ["cctv-installation", "internet"] },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path.join("."))).toContain("details.internet");
  });

  it("rejects an unknown lead type", () => {
    expect(
      leadSubmissionSchema.safeParse({ ...validSubmissions.contact, type: "other" }).success,
    ).toBe(false);
  });

  it("validates CCTV survey numbers and dates", () => {
    const bad = {
      ...validSubmissions.cctv_survey,
      details: {
        ...validSubmissions.cctv_survey.details,
        camerasEstimate: 0,
        preferredDate: "next week",
      },
    };
    const paths = leadSubmissionSchema.safeParse(bad).error?.issues.map((i) => i.path.join("."));
    expect(paths).toEqual(
      expect.arrayContaining(["details.camerasEstimate", "details.preferredDate"]),
    );
  });

  it("requires a description on support requests", () => {
    const result = leadSubmissionSchema.safeParse({ ...validSubmissions.support, message: "" });
    expect(result.success).toBe(false);
  });
});
