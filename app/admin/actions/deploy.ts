"use server";

import { actorFor } from "@/lib/auth/session";
import { checkForUpdates, deployConfig, readDeployStatus, startDeploy } from "@/lib/deploy";
import { writeAudit } from "@/lib/services/audit";

const denied = { ok: false as const, error: "You do not have permission to deploy." };
const disabled = {
  ok: false as const,
  error: "The deploy pipeline isn't enabled on this server (DEPLOY_ENABLED).",
};

function message(err: unknown) {
  const e = err as { stderr?: string; message?: string };
  return (e.stderr || e.message || "Something went wrong").toString().trim().slice(0, 500);
}

export async function checkForUpdatesAction() {
  if (!(await actorFor("deploy:run"))) return denied;
  if (!deployConfig.enabled) return disabled;
  try {
    return { ok: true as const, result: await checkForUpdates() };
  } catch (err) {
    return { ok: false as const, error: `Could not check GitHub: ${message(err)}` };
  }
}

export async function deployStatusAction() {
  if (!(await actorFor("deploy:run"))) return denied;
  return { ok: true as const, status: await readDeployStatus() };
}

export async function startDeployAction(expectedCommit: string) {
  const actor = await actorFor("deploy:run");
  if (!actor) return denied;
  if (!deployConfig.enabled) return disabled;
  const current = await readDeployStatus();
  if (current.unitActive || current.state === "running")
    return { ok: false as const, error: "A deploy is already running." };
  try {
    await startDeploy();
  } catch (err) {
    return { ok: false as const, error: `Could not start the deploy job: ${message(err)}` };
  }
  await writeAudit(actor, "deploy", "Website", expectedCommit.slice(0, 12), {
    commit: expectedCommit,
  });
  return { ok: true as const };
}
