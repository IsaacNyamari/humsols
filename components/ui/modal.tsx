"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/icons";

/** Accessible modal built on the native <dialog> (focus trap + Esc handled by the browser). */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="modal-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-0 text-fg shadow-2xl backdrop:bg-navy/60"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 id="modal-title" className="text-lg">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted hover:bg-bg-soft"
          aria-label="Close"
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
