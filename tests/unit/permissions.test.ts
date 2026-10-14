import { describe, expect, it } from "vitest";
import { can, canManageRole, ForbiddenError } from "@/lib/permissions";
import { createContent, listContent } from "@/lib/services/content";
import { getLead, leadStats, listLeads, updateLeadStatus } from "@/lib/services/leads";
import { updatePageCopy } from "@/lib/services/page-content";
import { updateSiteSettings, DEFAULT_SETTINGS } from "@/lib/services/settings";
import { submitLead } from "@/lib/services/submit-lead";
import { changeUserRole, hashPassword, inviteUser, setUserActive } from "@/lib/services/users";
import { User } from "@/models";
import { actor, validSubmissions } from "./helpers";

const service = { slug: "test-service", title: "Test service", summary: "A test service summary." };

describe("role matrix", () => {
  it("matches the brief", () => {
    expect(can("owner", "users:manage")).toBe(true);
    expect(can("admin", "settings:write")).toBe(true);
    expect(can("editor", "content:write")).toBe(true);
    expect(can("editor", "leads:read")).toBe(false);
    expect(can("sales", "leads:write")).toBe(true);
    expect(can("sales", "content:write")).toBe(false);
    expect(can("sales", "settings:write")).toBe(false);
    expect(canManageRole("admin", "owner")).toBe(false);
    expect(canManageRole("admin", "editor")).toBe(true);
    expect(canManageRole("owner", "owner")).toBe(true);
  });
});

describe("server-side enforcement", () => {
  it("editor cannot see or change leads", async () => {
    const res = await submitLead(validSubmissions.contact, { ip: "10.1.1.1" });
    if (res.status !== 201) throw new Error("expected 201");
    const editor = actor("editor");
    await expect(listLeads(editor, {})).rejects.toBeInstanceOf(ForbiddenError);
    await expect(getLead(editor, res.body.id)).rejects.toBeInstanceOf(ForbiddenError);
    await expect(leadStats(editor)).rejects.toBeInstanceOf(ForbiddenError);
    await expect(updateLeadStatus(editor, res.body.id, "won")).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("sales can work leads but cannot edit content, page text or settings", async () => {
    const sales = actor("sales");
    const res = await submitLead(validSubmissions.contact, { ip: "10.1.1.2" });
    if (res.status !== 201) throw new Error("expected 201");
    await expect(updateLeadStatus(sales, res.body.id, "contacted")).resolves.toBeUndefined();
    expect((await listLeads(sales, {})).items[0].status).toBe("contacted");

    await expect(createContent(sales, "services", service)).rejects.toBeInstanceOf(ForbiddenError);
    await expect(listContent(sales, "services")).rejects.toBeInstanceOf(ForbiddenError);
    await expect(updatePageCopy(sales, "home", {})).rejects.toBeInstanceOf(ForbiddenError);
    await expect(updateSiteSettings(sales, { ...DEFAULT_SETTINGS })).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("editor can edit content", async () => {
    const result = await createContent(actor("editor"), "services", service);
    expect(result.ok).toBe(true);
  });
});

describe("user management", () => {
  async function makeUser(role: "owner" | "admin" | "editor", email: string) {
    const u = await User.create({
      name: role,
      email,
      role,
      passwordHash: await hashPassword("password-123"),
      active: true,
    });
    return { id: String(u._id), name: role, email, role };
  }

  it("admin cannot create or change owners; owner can", async () => {
    const owner = await makeUser("owner", "o@example.test");
    const admin = await makeUser("admin", "a@example.test");
    await expect(
      inviteUser(admin, { name: "X", email: "x@example.test", role: "owner" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(setUserActive(admin, owner.id, false)).rejects.toBeInstanceOf(ForbiddenError);
    const invited = await inviteUser(owner, {
      name: "Ed",
      email: "ed@example.test",
      role: "editor",
    });
    expect(invited.ok).toBe(true);
  });

  it("never removes the last active owner", async () => {
    const owner = await makeUser("owner", "solo@example.test");
    const other = await makeUser("owner", "second@example.test");
    await changeUserRole(other, owner.id, "admin"); // two owners -> fine
    await expect(changeUserRole(other, other.id, "admin")).rejects.toThrow(
      /at least one active owner/,
    );
  });
});
