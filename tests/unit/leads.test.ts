import { describe, expect, it } from "vitest";
import { sendLeadEmails } from "@/lib/mail/lead-emails";
import { setMailSenderForTests, type MailMessage } from "@/lib/mail/transport";
import { rateLimit } from "@/lib/rate-limit";
import { submitLead } from "@/lib/services/submit-lead";
import { Lead } from "@/models";
import { validSubmissions } from "./helpers";

const meta = (ip = "10.0.0.1") => ({ ip, userAgent: "vitest" });

describe("lead creation", () => {
  it("saves type-specific details and a reference", async () => {
    const res = await submitLead(validSubmissions.quote, meta());
    expect(res.status).toBe(201);
    if (res.status !== 201) return;
    expect(res.body.reference).toMatch(/^HS-Q-\d{4}-0001$/);

    const lead = await Lead.findById(res.body.id).lean();
    expect(lead?.type).toBe("quote");
    expect(lead?.services).toEqual(["cctv-installation"]);
    expect(lead?.details).toMatchObject({
      cctv: { cameras: 8, placement: "both", siteType: "office" },
    });
    expect(lead?.consent.given).toBe(true);
    expect(lead?.status).toBe("new");
  });

  it("issues unique, sequential references per type", async () => {
    const refs: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = await submitLead(validSubmissions.internet_coverage, meta(`10.0.1.${i}`));
      if (r.status === 201) refs.push(r.body.reference);
    }
    const s = await submitLead(validSubmissions.support, meta("10.0.2.1"));
    expect(new Set(refs).size).toBe(3);
    expect(refs[2]).toMatch(/-IC-\d{4}-0003$/);
    expect(s.status === 201 && s.body.reference).toMatch(/^HS-S-\d{4}-0001$/);
  });

  it("derives services from internet, CCTV and support leads", async () => {
    const a = await submitLead(validSubmissions.cctv_survey, meta("10.0.3.1"));
    const b = await submitLead(validSubmissions.support, meta("10.0.3.2"));
    const leads = await Lead.find({}).lean();
    expect(a.status).toBe(201);
    expect(b.status).toBe(201);
    expect(leads.find((l) => l.type === "cctv_survey")?.services).toEqual(["cctv-installation"]);
    expect(leads.find((l) => l.type === "support")?.services).toEqual(["internet"]);
  });

  it("returns field errors for invalid input and saves nothing", async () => {
    const res = await submitLead({ ...validSubmissions.contact, email: "bad" }, meta());
    expect(res.status).toBe(400);
    if (res.status === 400) expect(res.body.fieldErrors?.email).toBeTruthy();
    expect(await Lead.countDocuments()).toBe(0);
  });
});

describe("spam protection", () => {
  it("rejects submissions that fill the honeypot", async () => {
    const res = await submitLead(
      { ...validSubmissions.contact, website: "http://spam.example" },
      meta(),
    );
    expect(res.status).toBe(400);
    expect(await Lead.countDocuments()).toBe(0);
  });

  it("rate limits after 5 submissions per IP in 10 minutes", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++)
      statuses.push((await submitLead(validSubmissions.contact, meta("10.9.9.9"))).status);
    expect(statuses.slice(0, 5)).toEqual([201, 201, 201, 201, 201]);
    expect(statuses[5]).toBe(429);
    expect(await Lead.countDocuments()).toBe(5);
    // A different IP is unaffected.
    expect((await submitLead(validSubmissions.contact, meta("10.9.9.10"))).status).toBe(201);
  });

  it("limiter window expires", () => {
    const opts = { max: 2, windowMs: 1000 };
    expect(rateLimit("k", opts, 0).ok).toBe(true);
    expect(rateLimit("k", opts, 10).ok).toBe(true);
    expect(rateLimit("k", opts, 20).ok).toBe(false);
    expect(rateLimit("k", opts, 1500).ok).toBe(true);
  });
});

describe("lead emails", () => {
  it("sends a notification and an auto-reply with the reference", async () => {
    const sent: MailMessage[] = [];
    setMailSenderForTests(async (m) => void sent.push(m));
    const res = await submitLead(validSubmissions.contact, meta());
    if (res.status !== 201) throw new Error("expected 201");

    await sendLeadEmails(res.body.id);
    expect(sent).toHaveLength(2);
    expect(sent[0].to).toEqual(["info@humsols.com"]);
    expect(sent[0].text).toContain(res.body.reference);
    expect(sent[1].to).toBe("jane@example.test");
    expect(sent[1].html).toContain(res.body.reference);
    const lead = await Lead.findById(res.body.id).lean();
    expect(lead?.emailFailed).toBe(false);
    expect(lead?.emailLog.map((l) => l.status)).toEqual(["sent", "sent"]);
  });

  it("keeps the lead and records the error when email fails", async () => {
    setMailSenderForTests(async () => {
      throw new Error("SMTP connection refused");
    });
    const res = await submitLead(validSubmissions.support, meta());
    if (res.status !== 201) throw new Error("expected 201");

    await expect(sendLeadEmails(res.body.id)).resolves.toBeDefined();
    const lead = await Lead.findById(res.body.id).lean();
    expect(lead).not.toBeNull();
    expect(lead?.emailFailed).toBe(true);
    expect(lead?.emailLog).toHaveLength(2);
    expect(lead?.emailLog[0].error).toContain("SMTP connection refused");
  });

  it("escapes customer input in HTML emails", async () => {
    const sent: MailMessage[] = [];
    setMailSenderForTests(async (m) => void sent.push(m));
    const res = await submitLead(
      { ...validSubmissions.contact, message: "<script>alert(1)</script> hello there" },
      meta(),
    );
    if (res.status !== 201) throw new Error("expected 201");
    await sendLeadEmails(res.body.id);
    expect(sent[0].html).not.toContain("<script>alert(1)</script>");
    expect(sent[0].html).toContain("&lt;script&gt;");
  });
});
