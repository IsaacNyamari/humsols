import { Markdown } from "@/components/markdown";
import { PageHeader } from "@/components/site/sections";
import { getPageCopy } from "@/lib/data/public";

/** Privacy / terms: text edited in Admin > Page text (Markdown). */
export async function LegalPage({ pageKey }: { pageKey: "privacy" | "terms" }) {
  const copy = await getPageCopy(pageKey);
  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
      <div className="container-page max-w-3xl py-14">
        <Markdown className="[&_blockquote]:rounded-lg [&_blockquote]:border-amber-400 [&_blockquote]:bg-amber-50 [&_blockquote]:p-4 [&_blockquote]:text-amber-900 dark:[&_blockquote]:bg-amber-400/10 dark:[&_blockquote]:text-amber-200">
          {copy.body}
        </Markdown>
      </div>
    </>
  );
}
