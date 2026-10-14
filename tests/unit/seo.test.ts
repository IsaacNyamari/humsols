import { describe, expect, it } from "vitest";
import { auditPage } from "@/lib/seo-audit";
import { settingsInput } from "@/lib/validation/content";

const verification = settingsInput.shape.verification;

describe("verification codes", () => {
  it("accepts a bare code or extracts it from a pasted meta tag", () => {
    expect(verification.parse({ google: "abc_DEF-123", bing: "" }).google).toBe("abc_DEF-123");
    expect(
      verification.parse({
        google: '<meta name="google-site-verification" content="XyZ-12_ab" />',
        bing: "",
      }).google,
    ).toBe("XyZ-12_ab");
    expect(verification.parse({}).google).toBe("");
  });

  it("rejects anything that isn't a code", () => {
    expect(verification.safeParse({ google: "bad code!", bing: "" }).success).toBe(false);
    expect(verification.safeParse({ google: "<script>x</script>", bing: "" }).success).toBe(false);
  });
});

describe("SEO checks", () => {
  it("passes a well-formed page", () => {
    const r = auditPage({
      path: "/x",
      title: "CCTV installation in Nairobi",
      description:
        "Free site survey, IP and analog cameras, NVR setup and phone viewing for homes and businesses across Nairobi.",
    });
    expect(r.issues).toEqual([]);
    expect(r.level).toBe("ok");
  });

  it("flags missing, short, long and placeholder text", () => {
    expect(auditPage({ path: "/a", title: "", description: "" }).issues).toEqual(
      expect.arrayContaining(["Missing title", "Missing description"]),
    );
    expect(
      auditPage({ path: "/b", title: "x".repeat(70), description: "Too short" }).issues,
    ).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Title is long/),
        expect.stringMatching(/Description is short/),
      ]),
    );
    const p = auditPage({
      path: "/c",
      title: "[PLACEHOLDER: title]",
      description: "d".repeat(120),
    });
    expect(p.level).toBe("error");
    expect(p.issues).toContain("Contains placeholder text");
  });
});
