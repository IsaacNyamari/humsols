"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  checkForUpdatesAction,
  deployStatusAction,
  startDeployAction,
} from "@/app/admin/actions/deploy";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { Commit, DeployStatus } from "@/lib/deploy";
import { formatDate } from "@/lib/utils";

type UpdateResult = {
  branch: string;
  live: Commit | null;
  latest: Commit | null;
  pending: Commit[];
  upToDate: boolean;
  checkedAt: string;
};

const STATE_TONE = {
  idle: "neutral",
  running: "warning",
  success: "success",
  failed: "danger",
} as const;
const STATE_LABEL = {
  idle: "No deploys yet",
  running: "Deploying…",
  success: "Last deploy succeeded",
  failed: "Last deploy failed",
} as const;

function CommitLine({ c }: { c: Commit }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium">{c.subject}</p>
      <p className="text-xs text-muted">
        <code className="rounded bg-bg-soft px-1">{c.short}</code> · {c.author} ·{" "}
        {formatDate(c.date, true)}
      </p>
    </div>
  );
}

export function DeployPanel({
  initialStatus,
  enabled,
}: {
  initialStatus: DeployStatus;
  enabled: boolean;
}) {
  const toast = useToast();
  const [status, setStatus] = useState(initialStatus);
  const [updates, setUpdates] = useState<UpdateResult>();
  const [error, setError] = useState<string>();
  const [confirm, setConfirm] = useState(false);
  const [checking, startCheck] = useTransition();
  const [starting, startStart] = useTransition();
  const logRef = useRef<HTMLPreElement>(null);
  const running = status.state === "running" || status.unitActive;
  const wasRunning = useRef(running);

  const refresh = useCallback(async () => {
    const r = await deployStatusAction();
    if (r.ok) setStatus(r.status);
  }, []);

  // Poll while a deploy runs; announce the result when it finishes.
  useEffect(() => {
    if (!running) return;
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [running, refresh]);

  useEffect(() => {
    if (wasRunning.current && !running) {
      if (status.state === "success") toast("Deploy finished — the new version is live");
      else if (status.state === "failed")
        toast("Deploy failed — the previous version is still live", "error");
      setUpdates(undefined);
    }
    wasRunning.current = running;
  }, [running, status.state, toast]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [status.log]);

  function check() {
    setError(undefined);
    startCheck(async () => {
      const r = await checkForUpdatesAction();
      if (r.ok) setUpdates(r.result);
      else setError(r.error);
    });
  }

  function deploy() {
    const target = updates?.latest?.hash ?? "";
    setConfirm(false);
    startStart(async () => {
      const r = await startDeployAction(target);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      toast("Deploy started", "info");
      setStatus((s) => ({ ...s, state: "running", step: "Starting", log: "" }));
      wasRunning.current = true;
      setTimeout(refresh, 1500);
    });
  }

  return (
    <div className="space-y-6">
      {!enabled ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
          The deploy pipeline is only available on the production server (set{" "}
          <code>DEPLOY_ENABLED=true</code>). See DEPLOYMENT.md › “Deploying from the admin”.
        </div>
      ) : null}
      <FormError message={error} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base">Live version</h2>
            <Badge tone={STATE_TONE[status.state]}>
              {running ? STATE_LABEL.running : STATE_LABEL[status.state]}
            </Badge>
          </div>
          {updates?.live ? (
            <CommitLine c={updates.live} />
          ) : status.deployedCommit ? (
            <p className="text-sm">
              <code className="rounded bg-bg-soft px-1">{status.deployedCommit.slice(0, 7)}</code>
              {status.deployedAt ? (
                <span className="text-muted">
                  {" "}
                  · deployed {formatDate(status.deployedAt, true)}
                </span>
              ) : null}
            </p>
          ) : (
            <p className="text-sm text-muted">Press “Check for updates” to see the live version.</p>
          )}
          {status.state === "failed" && status.message ? (
            <p className="mt-3 text-sm text-danger">{status.message}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              onClick={check}
              disabled={!enabled || checking || running}
              data-testid="check-updates"
            >
              <Icon name="history" className="size-4" />{" "}
              {checking ? "Checking GitHub…" : "Check for updates"}
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-base">Updates on GitHub</h2>
          {!updates ? (
            <p className="text-sm text-muted">Not checked yet.</p>
          ) : updates.upToDate ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-success">
              <Icon name="check" className="size-5" /> Up to date with <code>{updates.branch}</code>
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm">
                <strong>{updates.pending.length}</strong> new commit
                {updates.pending.length === 1 ? "" : "s"} on <code>{updates.branch}</code>:
              </p>
              <ul className="max-h-64 space-y-3 overflow-y-auto">
                {updates.pending.map((c) => (
                  <li key={c.hash}>
                    <CommitLine c={c} />
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5"
                onClick={() => setConfirm(true)}
                disabled={running || starting}
                data-testid="deploy"
              >
                <Icon name="bolt" className="size-4" /> Deploy {updates.latest?.short}
              </Button>
            </>
          )}
          {updates ? (
            <p className="mt-4 text-xs text-muted">Checked {formatDate(updates.checkedAt, true)}</p>
          ) : null}
        </Card>
      </div>

      {(running || status.log) && (
        <Card>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base">
              {running ? `Deploying — ${status.step ?? "starting"}` : "Last deploy log"}
            </h2>
            {status.startedAt ? (
              <span className="text-xs text-muted">
                Started {formatDate(status.startedAt, true)}
                {status.finishedAt && !running
                  ? ` · finished ${formatDate(status.finishedAt, true)}`
                  : ""}
              </span>
            ) : null}
          </div>
          <pre
            ref={logRef}
            className="max-h-96 overflow-auto rounded-lg bg-navy p-4 text-xs leading-relaxed text-slate-200"
            aria-live="polite"
          >
            {status.log || "Waiting for output…"}
          </pre>
        </Card>
      )}

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Deploy the latest version?">
        <div className="space-y-3 text-sm">
          <p>
            This pulls <code>{updates?.latest?.short}</code> from GitHub, builds the site (a few
            minutes) and then restarts it. The current version stays live while it builds.
          </p>
          <p className="text-muted">
            If anything fails, the previous version is restored automatically.
          </p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
          <Button onClick={deploy}>Deploy now</Button>
        </div>
      </Modal>
    </div>
  );
}
