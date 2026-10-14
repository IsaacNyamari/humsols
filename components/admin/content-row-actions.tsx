"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  deleteContentAction,
  moveContentAction,
  setPublishedAction,
} from "@/app/admin/actions/content";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

export function PublishToggle({
  kind,
  id,
  published,
  labels,
}: {
  kind: string;
  id: string;
  published: boolean;
  labels: [string, string];
}) {
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={published}
      disabled={pending}
      data-testid={`publish-${id}`}
      onClick={() =>
        start(async () => {
          const r = await setPublishedAction(kind, id, !published);
          toast(
            r.ok
              ? published
                ? `Now ${labels[1].toLowerCase()}`
                : `Now ${labels[0].toLowerCase()}`
              : (r.error ?? "Failed"),
            r.ok ? "success" : "error",
          );
        })
      }
      className="inline-flex items-center gap-2 text-sm font-semibold"
    >
      <span
        className={`relative h-6 w-10 rounded-full transition-colors ${published ? "bg-success" : "bg-border"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${published ? "left-[1.125rem]" : "left-0.5"}`}
        />
      </span>
      {published ? labels[0] : labels[1]}
    </button>
  );
}

export function RowActions({
  kind,
  id,
  title,
  ordered,
  first,
  last,
  publicPath,
}: {
  kind: string;
  id: string;
  title: string;
  ordered: boolean;
  first: boolean;
  last: boolean;
  publicPath?: string | null;
}) {
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const moveBy = (direction: "up" | "down") =>
    start(async () => void (await moveContentAction(kind, id, direction)));

  return (
    <div className="flex items-center justify-end gap-1">
      {ordered ? (
        <>
          <button
            type="button"
            className="rounded-md p-2 hover:bg-bg-soft disabled:opacity-30"
            disabled={first || pending}
            onClick={() => moveBy("up")}
            aria-label={`Move ${title} up`}
          >
            <Icon name="up" className="size-4" />
          </button>
          <button
            type="button"
            className="rounded-md p-2 hover:bg-bg-soft disabled:opacity-30"
            disabled={last || pending}
            onClick={() => moveBy("down")}
            aria-label={`Move ${title} down`}
          >
            <Icon name="chevronDown" className="size-4" />
          </button>
        </>
      ) : null}
      {publicPath ? (
        <a
          href={publicPath}
          target="_blank"
          rel="noopener"
          className="rounded-md p-2 hover:bg-bg-soft"
          aria-label={`View ${title} on the site`}
        >
          <Icon name="eye" className="size-4" />
        </a>
      ) : null}
      <Link
        href={`/admin/content/${kind}/${id}`}
        className="rounded-md p-2 hover:bg-bg-soft"
        aria-label={`Edit ${title}`}
      >
        <Icon name="edit" className="size-4" />
      </Link>
      <button
        type="button"
        className="rounded-md p-2 text-danger hover:bg-danger/10"
        onClick={() => setConfirm(true)}
        aria-label={`Delete ${title}`}
      >
        <Icon name="trash" className="size-4" />
      </button>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Delete this item?">
        <p className="text-sm">
          <strong>{title}</strong> will be removed from the site permanently. To hide it
          temporarily, unpublish it instead.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await deleteContentAction(kind, id);
                setConfirm(false);
                toast(r.ok ? "Deleted" : (r.error ?? "Failed"), r.ok ? "success" : "error");
              })
            }
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
