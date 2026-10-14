import { describe, expect, it } from "vitest";
import { parseCommits } from "@/lib/deploy";
import { can } from "@/lib/permissions";

describe("deploy pipeline", () => {
  it("parses git log output (subjects may contain separators)", () => {
    const sep = "\u001f";
    const out = [
      ["a".repeat(40), "aaaaaaa", "Isaac", "2026-10-14T20:00:00+03:00", "Add deploy page"].join(
        sep,
      ),
      ["b".repeat(40), "bbbbbbb", "Isaac", "2026-10-14T19:00:00+03:00", "Fix: a", "b"].join(sep),
      "",
    ].join("\n");
    const commits = parseCommits(out);
    expect(commits).toHaveLength(2);
    expect(commits[0]).toMatchObject({
      short: "aaaaaaa",
      author: "Isaac",
      subject: "Add deploy page",
    });
    expect(commits[1].subject).toBe(`Fix: a${sep}b`);
  });

  it("only owners and admins can deploy", () => {
    expect(can("owner", "deploy:run")).toBe(true);
    expect(can("admin", "deploy:run")).toBe(true);
    expect(can("editor", "deploy:run")).toBe(false);
    expect(can("sales", "deploy:run")).toBe(false);
  });
});
