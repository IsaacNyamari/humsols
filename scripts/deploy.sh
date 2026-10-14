#!/usr/bin/env bash
# Redeploy humsols.com: pull, install, build. Run as the `humsols` user, then
# restart the service:  sudo systemctl restart humsols
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/humsols/app}"
ENV_FILE="${ENV_FILE:-/etc/humsols/humsols.env}"

cd "$APP_DIR"
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

echo "==> git pull"
git pull --ff-only

echo "==> npm ci"
npm ci

echo "==> seed (inserts anything new, never overwrites edits)"
npm run seed

echo "==> build"
npm run build

echo "==> done. Now run: sudo systemctl restart humsols"
