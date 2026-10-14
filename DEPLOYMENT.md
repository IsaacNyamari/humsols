# Deploying humsols.com

Production runs on the Ubuntu 24.04 server at `217.20.120.238` (nginx, certbot, BIND, Stalwart mail, MySQL for HS Water Billing).

> **Do not use or change** these ports: 80/443 (nginx), 3306 (MySQL), 6001 (Reverb for HS Water Billing), 8080 (Stalwart admin), 25/465/587/993/995/4190 (mail).

## Day-to-day: deploying from the admin

1. Push to `main` on GitHub (`https://github.com/IsaacNyamari/humsols`).
2. In **Admin › Deploy** (owners and admins), click **Check for updates**. It lists the new commits on GitHub that are not live yet.
3. Click **Deploy**. The pipeline:
   - pulls `main`
   - runs `npm ci`, only if `package-lock.json` changed
   - runs `npm run seed`, which adds new default content and never overwrites edits
   - builds into `.next-stage` while the current version keeps serving visitors
   - swaps the new build in, restarts `humsols-web`, and checks that the site answers

   If any step fails, the previous code and build are restored automatically, and the log on the page shows what went wrong.

From a shell, the same deploy is `sudo systemctl start humsols-deploy` (log: `/var/www/humsols-data/deploy/deploy.log`).

## Server layout

| What                                   | Where                                                                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| App (git checkout, owned by `humsols`) | `/var/www/humsols`                                                                                                            |
| Uploads                                | `/var/www/humsols-data/uploads`                                                                                               |
| Deploy status and log                  | `/var/www/humsols-data/deploy/`                                                                                               |
| Environment (secrets)                  | `/etc/humsols/humsols.env` (root:humsols, 640)                                                                                |
| Deploy settings (`REPO_URL`, `BRANCH`) | `/etc/humsols/deploy.conf`                                                                                                    |
| Web service                            | `humsols-web.service`: `next start` on **127.0.0.1:3000** as user `humsols`                                                   |
| Deploy job                             | `humsols-deploy.service` → `/usr/local/bin/humsols-deploy-pipeline` (root, one-shot)                                          |
| Permission for the admin button        | `/etc/polkit-1/rules.d/50-humsols-deploy.rules` (lets `humsols` start that one unit)                                          |
| Database                               | MongoDB 8.0 on 127.0.0.1:27017, auth on, database `humsols`                                                                   |
| Backups                                | `/etc/cron.d/humsols-backup` → `/usr/local/bin/humsols-backup`, nightly, 14 days, in `/var/backups/humsols`                   |
| nginx                                  | `/etc/nginx/sites-available/humsols.com`: proxies to :3000 and shows the holding page (`/var/www/humsols.com`) on 502/503/504 |

The source for the deploy pieces lives in this repo under [`deploy/server/`](deploy/server/).

## Environment

`/etc/humsols/humsols.env` holds everything listed in [.env.example](.env.example). Production-specific values:

```ini
NODE_ENV=production
HOSTNAME=127.0.0.1
PORT=3000
SITE_URL=https://humsols.com
AUTH_URL=https://humsols.com
AUTH_TRUST_HOST=true
SMTP_HOST=mail.humsols.com
SMTP_PORT=465
SMTP_SECURE=true
UPLOAD_DIR=/var/www/humsols-data/uploads
DEPLOY_ENABLED=true
```

`npm run build` reads published content from MongoDB, so MongoDB must be running during builds. It always is on this server.

## Installing or updating the deploy pipeline pieces

Only needed when files in `deploy/server/` change:

```bash
cd /var/www/humsols && sudo -u humsols git pull
sudo install -m 750 deploy/server/humsols-deploy-pipeline /usr/local/bin/humsols-deploy-pipeline
sudo install -m 644 deploy/server/humsols-deploy.service /etc/systemd/system/humsols-deploy.service
sudo install -m 644 deploy/server/50-humsols-deploy.rules /etc/polkit-1/rules.d/50-humsols-deploy.rules
sudo systemctl daemon-reload
```

## Email (SMTP via Stalwart on the same server)

The site sends through `mail.humsols.com:465` as `info@humsols.com`. Stalwart must present the Let's Encrypt certificate, not its built-in self-signed one, or sending fails with `self-signed certificate`. The certificate is kept up to date in `/etc/stalwart/certs/` by `/etc/letsencrypt/renewal-hooks/deploy/stalwart.sh`.

To check SMTP from the server without sending mail:

```bash
sudo -u humsols -H bash -c 'set -a; . /etc/humsols/humsols.env; set +a; cd /var/www/humsols; node -e "require(\"nodemailer\").createTransport({host:process.env.SMTP_HOST,port:+process.env.SMTP_PORT,secure:true,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}}).verify().then(()=>console.log(\"SMTP OK\"),e=>console.log(\"SMTP FAILED:\",e.message))"'
```

Failed sends never lose a lead. They're recorded on the lead, flagged on the dashboard, and can be retried from the lead page.

## Backups and restore

Nightly at 02:45. To restore (this replaces the current data):

```bash
mongorestore --host 127.0.0.1 --username mongoadmin --authenticationDatabase admin \
  --config /etc/humsols/mongodump.yaml --gzip --archive=/var/backups/humsols/humsols-<date>.archive.gz --drop
```

Uploads (`/var/www/humsols-data/uploads`) are not in the database dump, so copy that folder off the server as well.

## Troubleshooting

```bash
systemctl status humsols-web                 # is the site running?
journalctl -u humsols-web -n 100             # app logs (mail errors are tagged [mail])
cat /var/www/humsols-data/deploy/deploy.log  # last deploy
systemctl status humsols-deploy              # deploy job state
```

If the app is down, nginx shows the holding page automatically.

## First-time setup (already done on this server)

For a fresh server:

1. Install MongoDB 8.0, bound to 127.0.0.1 with authorization enabled. Create a `humsols` database user with `readWrite` on `humsols`.
2. Create the system user `humsols`, the folders above, `/etc/humsols/humsols.env` and `deploy.conf`.
3. Clone into `/var/www/humsols` as `humsols`. Run `npm ci`. Set `SEED_OWNER_EMAIL`/`SEED_OWNER_PASSWORD`, then run `npm run seed` and `npm run build` with the env loaded. Remove `SEED_OWNER_PASSWORD` afterwards.
4. Install `humsols-web.service` and the three deploy pieces above. Run `systemctl enable --now humsols-web`.
5. Point the nginx site at `127.0.0.1:3000`, keeping the certbot lines.
