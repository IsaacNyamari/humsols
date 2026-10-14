import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

// Admin deploy pipeline. The web app (unprivileged) only:
//   - reads git state and fetches from GitHub, and
//   - asks systemd to start humsols-deploy.service (allowed by a polkit rule).
// The privileged work (pull, build, swap, restart, rollback) is done by
// deploy/server/humsols-deploy-pipeline, which writes status.json + deploy.log.

const run = promisify(execFile);

export const deployConfig = {
  get enabled() {
    return process.env.DEPLOY_ENABLED === "true";
  },
  get stateDir() {
    return process.env.DEPLOY_STATE_DIR ?? "/var/www/humsols-data/deploy";
  },
  get branch() {
    return process.env.DEPLOY_BRANCH ?? "main";
  },
  get unit() {
    return process.env.DEPLOY_UNIT ?? "humsols-deploy.service";
  },
  appDir: process.cwd(),
};

export type Commit = { hash: string; short: string; author: string; date: string; subject: string };

export type DeployStatus = {
  state: "idle" | "running" | "success" | "failed";
  step?: string;
  message?: string;
  startedAt?: string;
  finishedAt?: string;
  fromCommit?: string;
  toCommit?: string;
  deployedCommit?: string;
  deployedAt?: string;
  log: string;
  unitActive: boolean;
};

const SEP = "\u001f";
const FORMAT = ["%H", "%h", "%an", "%cI", "%s"].join(SEP);

export function parseCommits(output: string): Commit[] {
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [hash, short, author, date, ...subject] = line.split(SEP);
      return { hash, short, author, date, subject: subject.join(SEP) };
    });
}

async function git(...args: string[]) {
  const { stdout } = await run("git", args, {
    cwd: deployConfig.appDir,
    timeout: 60_000,
    maxBuffer: 2_000_000,
  });
  return stdout.trim();
}

async function commitInfo(ref: string): Promise<Commit | null> {
  try {
    return parseCommits(await git("log", "-1", `--format=${FORMAT}`, ref))[0] ?? null;
  } catch {
    return null;
  }
}

export async function readDeployStatus(): Promise<DeployStatus> {
  let status: Partial<DeployStatus> = {};
  try {
    status = JSON.parse(await readFile(path.join(deployConfig.stateDir, "status.json"), "utf8"));
  } catch {}
  let log = "";
  try {
    log = (await readFile(path.join(deployConfig.stateDir, "deploy.log"), "utf8"))
      .split("\n")
      .slice(-300)
      .join("\n");
  } catch {}
  let unitActive = false;
  try {
    // "activating" while a oneshot runs; is-active exits non-zero otherwise.
    const { stdout } = await run("systemctl", ["is-active", deployConfig.unit], {
      timeout: 10_000,
    });
    unitActive = ["active", "activating"].includes(stdout.trim());
  } catch (err) {
    const out = (err as { stdout?: string }).stdout?.trim();
    unitActive = out === "activating";
  }
  return { state: "idle", ...status, log, unitActive } as DeployStatus;
}

/** Fetch from GitHub and compare what's live with the latest commit on the branch. */
export async function checkForUpdates() {
  const { branch } = deployConfig;
  await git("fetch", "--quiet", "origin", branch);
  const status = await readDeployStatus();
  const head = await git("rev-parse", "HEAD");
  const live = status.deployedCommit || head;
  const remote = await git("rev-parse", `origin/${branch}`);
  const pending =
    live === remote
      ? []
      : parseCommits(await git("log", `--format=${FORMAT}`, `${live}..origin/${branch}`));
  return {
    branch,
    live: await commitInfo(live),
    latest: await commitInfo(remote),
    pending,
    upToDate: pending.length === 0,
    checkedAt: new Date().toISOString(),
  };
}

/** Ask systemd to run the deploy job. Returns immediately; progress is in status.json. */
export async function startDeploy() {
  await run("systemctl", ["start", "--no-block", deployConfig.unit], { timeout: 15_000 });
}
