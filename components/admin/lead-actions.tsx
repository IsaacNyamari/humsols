"use client";

import { useState, useTransition } from "react";
import {
  addLeadNoteAction,
  assignLeadAction,
  deleteLeadAction,
  resendLeadEmailsAction,
  setLeadStatusAction,
} from "@/app/admin/actions/leads";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusPipeline({ id, status }: { id: string; status: LeadStatus }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <div
      role="group"
      aria-label="Lead status"
      className="flex flex-wrap gap-1.5"
      data-testid="status-pipeline"
    >
      {LEAD_STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          disabled={pending || s === status}
          aria-pressed={s === status}
          onClick={() =>
            start(async () => {
              const r = await setLeadStatusAction(id, s);
              toast(
                r.ok ? `Status changed to ${s}` : (r.error ?? "Failed"),
                r.ok ? "success" : "error",
              );
            })
          }
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm font-semibold capitalize transition-colors disabled:cursor-default",
            s === status
              ? "border-primary bg-primary text-primary-fg"
              : "border-border bg-card hover:border-primary/50",
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export function AssignSelect({
  id,
  assignedTo,
  users,
}: {
  id: string;
  assignedTo?: string;
  users: { id: string; name: string }[];
}) {
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">Assigned to</span>
      <Select
        defaultValue={assignedTo ?? ""}
        disabled={pending}
        onChange={(e) => {
          const value = e.target.value;
          start(async () => {
            const r = await assignLeadAction(id, value);
            toast(r.ok ? "Assignment updated" : (r.error ?? "Failed"), r.ok ? "success" : "error");
          });
        }}
      >
        <option value="">Unassigned</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </Select>
    </label>
  );
}

export function NoteForm({ id }: { id: string }) {
  const toast = useToast();
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        start(async () => {
          const r = await addLeadNoteAction(id, text);
          if (r.ok) setText("");
          toast(r.ok ? "Note added" : (r.error ?? "Failed"), r.ok ? "success" : "error");
        });
      }}
    >
      <label htmlFor="note" className="sr-only">
        Internal note
      </label>
      <Textarea
        id="note"
        name="note"
        rows={3}
        placeholder="Add an internal note (not visible to the customer)…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button type="submit" size="sm" disabled={pending || !text.trim()}>
        {pending ? "Saving…" : "Add note"}
      </Button>
    </form>
  );
}

export function ResendEmailsButton({ id }: { id: string }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await resendLeadEmailsAction(id);
          toast(
            r.ok ? "Emails sent again — check the log below" : (r.error ?? "Failed"),
            r.ok ? "success" : "error",
          );
        })
      }
    >
      {pending ? "Sending…" : "Retry emails"}
    </Button>
  );
}

export function DeleteLeadButton({ id, reference }: { id: string; reference: string }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <Button variant="ghost" size="sm" className="text-danger" onClick={() => setOpen(true)}>
        Delete lead
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Delete ${reference}?`}>
        <p className="text-sm text-muted">
          This permanently removes the lead and its notes. Use “closed” or “lost” instead if you
          only want to file it away.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await deleteLeadAction(id);
                if (r && !r.ok) toast(r.error ?? "Failed", "error");
              })
            }
          >
            Delete permanently
          </Button>
        </div>
      </Modal>
    </>
  );
}
