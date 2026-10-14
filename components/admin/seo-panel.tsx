"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { refreshSitemapAction, saveVerificationAction } from "@/app/admin/actions/seo";
import { Icon } from "@/components/icons";
import { Button, ButtonA } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { Field, FormError, Input } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import type { SeoRow } from "@/lib/seo-audit";
import { cn } from "@/lib/utils";

function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // Fallback for browsers without the async clipboard API.
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      <Icon name={copied ? "check" : "file"} className="size-4" /> {copied ? "Copied" : label}
    </Button>
  );
}

const LEVEL = {
  error: { tone: "danger", label: "Fix" },
  warn: { tone: "warning", label: "Improve" },
  ok: { tone: "success", label: "Good" },
} as const;

export function SeoPanel({
  siteUrl,
  sitemapUrls,
  robotsTxt,
  rows,
  verification,
  canEditVerification,
}: {
  siteUrl: string;
  sitemapUrls: string[];
  robotsTxt: string;
  rows: SeoRow[];
  verification: { google: string; bing: string };
  canEditVerification: boolean;
}) {
  const toast = useToast();
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  const [showUrls, setShowUrls] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [saving, startSave] = useTransition();
  const [codes, setCodes] = useState(verification);
  const [codeError, setCodeError] = useState<string>();
  const [filter, setFilter] = useState<"all" | "issues">("issues");
  const counts = { error: 0, warn: 0, ok: 0 };
  for (const r of rows) counts[r.level]++;
  const shown = filter === "issues" ? rows.filter((r) => r.level !== "ok") : rows;
  const isLocal = /localhost|127\.0\.0\.1/.test(siteUrl);

  return (
    <div className="space-y-6">
      {/* 1. Sitemap */}
      <Card>
        <h2 className="text-lg">1. Your sitemap</h2>
        <p className="mt-1 text-sm text-muted">
          A list of every public page, built automatically from published content. It updates by
          itself when you publish, edit or remove content.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <code
            className="rounded-lg border border-border bg-bg-soft px-3 py-2 text-sm break-all"
            data-testid="sitemap-url"
          >
            {sitemapUrl}
          </code>
          <CopyButton text={sitemapUrl} label="Copy sitemap URL" />
          <ButtonA href="/sitemap.xml" target="_blank" rel="noopener" variant="ghost" size="sm">
            <Icon name="external" className="size-4" /> Open
          </ButtonA>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span>
            <strong>{sitemapUrls.length}</strong> URLs
          </span>
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => setShowUrls((v) => !v)}
            aria-expanded={showUrls}
          >
            {showUrls ? "Hide list" : "Show list"}
          </button>
          <CopyButton text={sitemapUrls.join("\n")} label="Copy all URLs" />
          <Button
            size="sm"
            variant="outline"
            disabled={refreshing}
            onClick={() =>
              startRefresh(async () => {
                const r = await refreshSitemapAction();
                toast(r.ok ? "Sitemap refreshed" : r.error, r.ok ? "success" : "error");
              })
            }
          >
            <Icon name="history" className="size-4" />{" "}
            {refreshing ? "Refreshing…" : "Refresh sitemap"}
          </Button>
        </div>
        {showUrls ? (
          <ul className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-border bg-bg-soft p-3 font-mono text-xs leading-6">
            {sitemapUrls.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        ) : null}
        {isLocal ? (
          <p className="mt-3 text-xs text-muted">
            This is a local copy, so the URLs show {siteUrl}. On the live server they use
            https://humsols.com.
          </p>
        ) : null}
      </Card>

      {/* 2. Search Console */}
      <Card>
        <h2 className="text-lg">2. Submit it to Google Search Console</h2>
        <ol className="mt-4 space-y-4 text-sm">
          <li className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-accent-fg">
              1
            </span>
            <div>
              Open{" "}
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener"
                className="font-semibold text-primary underline"
              >
                Google Search Console
              </a>{" "}
              and sign in with the Google account that should own the site.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-accent-fg">
              2
            </span>
            <div>
              Click <strong>Add property</strong> → choose <strong>URL prefix</strong> → enter{" "}
              <code className="rounded bg-bg-soft px-1">{siteUrl}/</code>.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-accent-fg">
              3
            </span>
            <div>
              Under verification, pick <strong>HTML tag</strong>, copy the tag Google shows, paste
              it into <strong>step 3 below</strong> and save. Then click <strong>Verify</strong> in
              Search Console.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-accent-fg">
              4
            </span>
            <div className="space-y-2">
              <p>
                In Search Console open <strong>Sitemaps</strong> (left menu), paste the sitemap
                address and click <strong>Submit</strong>:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="rounded-lg border border-border bg-bg-soft px-3 py-1.5">
                  sitemap.xml
                </code>
                <CopyButton text="sitemap.xml" />
                <span className="text-xs text-muted">
                  (Search Console already fills in {siteUrl}/ before it)
                </span>
              </div>
            </div>
          </li>
        </ol>
        <p className="mt-4 text-xs text-muted">
          You only submit once. Google re-reads the sitemap regularly; new pages are picked up
          automatically. Indexing usually takes a few days.
        </p>
      </Card>

      {/* 3. Verification */}
      <Card>
        <h2 className="text-lg">3. Verification codes</h2>
        <p className="mt-1 text-sm text-muted">
          Paste the tag (or just the code) that Google gives you. The website adds it to every page
          automatically — no files or DNS changes needed.
        </p>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setCodeError(undefined);
            startSave(async () => {
              const r = await saveVerificationAction(codes);
              if (r.ok) {
                setCodes(r.verification);
                toast("Verification codes saved — they're live now");
              } else setCodeError(r.error);
            });
          }}
        >
          <div className="sm:col-span-2">
            <FormError message={codeError} />
          </div>
          <Field
            id="v-google"
            label="Google site verification"
            hint='e.g. <meta name="google-site-verification" content="…" />'
          >
            <Input
              id="v-google"
              value={codes.google}
              onChange={(e) => setCodes((c) => ({ ...c, google: e.target.value }))}
              disabled={!canEditVerification}
              placeholder="Paste the tag or code"
              data-testid="google-verification"
            />
          </Field>
          <Field
            id="v-bing"
            label="Bing Webmaster verification (optional)"
            hint="The msvalidate.01 code from Bing Webmaster Tools"
          >
            <Input
              id="v-bing"
              value={codes.bing}
              onChange={(e) => setCodes((c) => ({ ...c, bing: e.target.value }))}
              disabled={!canEditVerification}
              placeholder="Paste the tag or code"
            />
          </Field>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={!canEditVerification || saving}>
              {saving ? "Saving…" : "Save codes"}
            </Button>
            {verification.google ? (
              <Badge tone="success">
                <Icon name="check" className="size-3.5" /> Google tag is live
              </Badge>
            ) : null}
            {!canEditVerification ? (
              <span className="text-xs text-muted">Only owners and admins can change these.</span>
            ) : null}
          </div>
        </form>
      </Card>

      {/* 4. Checks */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg">4. Page checks</h2>
            <p className="mt-1 text-sm text-muted">
              The title and description Google shows for each page.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge tone="danger">{counts.error} to fix</Badge>
            <Badge tone="warning">{counts.warn} to improve</Badge>
            <Badge tone="success">{counts.ok} good</Badge>
            <button
              type="button"
              className="ml-2 font-semibold text-primary hover:underline"
              onClick={() => setFilter((f) => (f === "all" ? "issues" : "all"))}
            >
              {filter === "all" ? "Show issues only" : "Show all pages"}
            </button>
          </div>
        </div>
        <div className="mt-4">
          {shown.length ? (
            <Table>
              <thead>
                <tr>
                  <Th>Page</Th>
                  <Th>What Google shows</Th>
                  <Th>Notes</Th>
                  <Th className="text-right">Edit</Th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.path}>
                    <Td className="align-top">
                      <a
                        href={r.path}
                        target="_blank"
                        rel="noopener"
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {r.path}
                      </a>
                      <div className="mt-1">
                        <Badge tone={LEVEL[r.level].tone}>{LEVEL[r.level].label}</Badge>
                      </div>
                    </Td>
                    <Td className="max-w-md align-top">
                      <p
                        className={cn(
                          "font-medium text-[#1a0dab] dark:text-[#8ab4f8]",
                          !r.title && "text-danger",
                        )}
                      >
                        {r.title || "(no title)"}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                        {r.description || "(no description)"}
                      </p>
                    </Td>
                    <Td className="align-top text-xs">
                      {r.issues.length ? (
                        <ul className="space-y-1">
                          {r.issues.map((i) => (
                            <li key={i}>{i}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </Td>
                    <Td className="text-right align-top">
                      {r.editHref ? (
                        <Link
                          href={r.editHref}
                          className="inline-flex rounded-md p-2 hover:bg-bg-soft"
                          aria-label={`Edit SEO for ${r.path}`}
                        >
                          <Icon name="edit" className="size-4" />
                        </Link>
                      ) : null}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="flex items-center gap-2 text-sm font-semibold text-success">
              <Icon name="check" className="size-5" /> Every page passes.
            </p>
          )}
        </div>
      </Card>

      {/* 5. robots.txt */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg">robots.txt</h2>
          <div className="flex gap-2">
            <CopyButton text={robotsTxt} />
            <ButtonA href="/robots.txt" target="_blank" rel="noopener" variant="ghost" size="sm">
              <Icon name="external" className="size-4" /> Open
            </ButtonA>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted">
          Tells search engines they may crawl everything except the admin and API, and where the
          sitemap is.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-bg-soft p-3 text-xs">{robotsTxt}</pre>
      </Card>
    </div>
  );
}
