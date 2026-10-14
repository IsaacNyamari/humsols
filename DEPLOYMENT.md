# Deploying humsols.com

Target: the existing Ubuntu 24.04 server (nginx, certbot, BIND, Node.js 22). The app replaces the static holding page at `https://humsols.com`.

> **Do not touch** these ports and services: 80/443 (nginx), 3306 (MySQL), 6001 (Reverb for HS Water Billing), 8080 (Stalwart admin), 25/465/587/993/995/4190 (mail).
> The app listens on **127.0.0.1:3000** and MongoDB on **127.0.0.1:27017**. Neither is exposed publicly.

Commands below are run as a sudo-capable user. Read each step before running it.

---

## 1. Check that the ports are free

```bash
sudo ss -ltnp | grep -E ':(3000|27017)\b' || echo "3000 and 27017 are free"
```

If something already uses 3000, choose another port (e.g. 3010) and use it everywhere `3000` appears below.

## 2. Install MongoDB Community (localhost only, auth on)

```bash
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt-get update && sudo apt-get install -y mongodb-org
sudo systemctl enable --now mongod
```

Confirm it is bound to localhost only (the default `/etc/mongod.conf` has `bindIp: 127.0.0.1`):

```bash
grep -A2 '^net:' /etc/mongod.conf
```

Create an admin user and a dedicated app user (use long random passwords, e.g. `openssl rand -base64 30`):

```bash
mongosh --quiet <<'EOF'
use admin
db.createUser({ user: "root", pwd: passwordPrompt(), roles: ["root"] })
use humsols
db.createUser({ user: "humsols", pwd: passwordPrompt(), roles: [{ role: "readWrite", db: "humsols" }] })
EOF
```

Turn on authentication: add this to `/etc/mongod.conf`, then restart MongoDB.

```yaml
security:
  authorization: enabled
```

```bash
sudo systemctl restart mongod
```

## 3. App user and code

```bash
sudo adduser --system --group --home /srv/humsols humsols
sudo mkdir -p /srv/humsols/app /srv/humsols/uploads /etc/humsols
sudo chown -R humsols:humsols /srv/humsols
sudo -u humsols git clone <REPOSITORY_URL> /srv/humsols/app
```

## 4. Environment file

Create `/etc/humsols/humsols.env` (owner root, mode 640, group humsols):

```bash
sudo install -m 640 -o root -g humsols /dev/null /etc/humsols/humsols.env
sudo nano /etc/humsols/humsols.env
```

```ini
NODE_ENV=production
HOSTNAME=127.0.0.1
PORT=3000
MONGODB_URI=mongodb://humsols:<APP_DB_PASSWORD>@127.0.0.1:27017/humsols?authSource=humsols
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://humsols.com
AUTH_TRUST_HOST=true
SITE_URL=https://humsols.com
MAIL_DRIVER=smtp
SMTP_HOST=mail.humsols.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@humsols.com
SMTP_PASSWORD=<mailbox password>
MAIL_FROM="Human Solutions <info@humsols.com>"
LEAD_NOTIFY_TO=info@humsols.com
SEED_OWNER_EMAIL=<owner email>
SEED_OWNER_PASSWORD=<strong password; remove from this file after seeding>
UPLOAD_DIR=/srv/humsols/uploads
MAX_UPLOAD_MB=10
```

## 5. First build and seed

The build reads content from MongoDB, so load the environment for these commands:

```bash
cd /srv/humsols/app
sudo -u humsols bash -c 'set -a; source /etc/humsols/humsols.env; set +a; npm ci && npm run seed && npm run build'
```

Then remove `SEED_OWNER_PASSWORD` from `/etc/humsols/humsols.env`. The account is created and its password is never changed by later seeds. Sign in and change it from **Admin › Account** if you like.

## 6. systemd service

`/etc/systemd/system/humsols.service`:

```ini
[Unit]
Description=humsols.com (Next.js)
After=network.target mongod.service
Requires=mongod.service

[Service]
Type=simple
User=humsols
Group=humsols
WorkingDirectory=/srv/humsols/app
EnvironmentFile=/etc/humsols/humsols.env
ExecStart=/usr/bin/npm start -- -H 127.0.0.1 -p 3000
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
ProtectSystem=full
ProtectHome=true
PrivateTmp=true
ReadWritePaths=/srv/humsols

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now humsols
curl -sI http://127.0.0.1:3000 | head -1     # expect HTTP/1.1 200
```

## 7. Switch nginx from the holding page to the app

Back up the current site file first. Only the `humsols.com` server block changes; `water-billing.humsols.com` and `mail.humsols.com` are separate files and stay untouched.

```bash
ls /etc/nginx/sites-enabled/
sudo cp /etc/nginx/sites-available/humsols.com /etc/nginx/sites-available/humsols.com.bak-$(date +%F)
```

In the **HTTPS** (`listen 443 ssl`) server block for `humsols.com www.humsols.com`, **keep** every `ssl_certificate…` and `include /etc/letsencrypt/…` line that certbot added. Replace the `root /var/www/humsols.com;` and `location /` lines with:

```nginx
    client_max_body_size 12m;            # admin image uploads (MAX_UPLOAD_MB + headroom)

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml application/xml;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }
```

`X-Real-IP` matters: the form rate limiter uses it to identify visitors.

Leave the port-80 block (the certbot HTTP→HTTPS redirect) as it is. Then test and reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -sI https://humsols.com | head -1
curl -sI https://water-billing.humsols.com | head -1     # still fine
```

**Rollback:** restore the `.bak-*` file, run `sudo nginx -t && sudo systemctl reload nginx`. The holding page in `/var/www/humsols.com` is untouched.

## 8. Nightly MongoDB backup (14-day retention)

`/usr/local/bin/humsols-backup`:

```bash
#!/usr/bin/env bash
set -euo pipefail
set -a; source /etc/humsols/humsols.env; set +a
DEST=/var/backups/humsols
STAMP=$(date +%F-%H%M)
mkdir -p "$DEST"
mongodump --uri="$MONGODB_URI" --archive="$DEST/humsols-$STAMP.archive.gz" --gzip
tar -czf "$DEST/uploads-$STAMP.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
find "$DEST" -type f -mtime +14 -delete
```

```bash
sudo chmod 750 /usr/local/bin/humsols-backup
sudo mkdir -p /var/backups/humsols && sudo chmod 700 /var/backups/humsols
echo '30 2 * * * root /usr/local/bin/humsols-backup >> /var/log/humsols-backup.log 2>&1' | sudo tee /etc/cron.d/humsols-backup
sudo /usr/local/bin/humsols-backup && ls -lh /var/backups/humsols
```

Restore: `mongorestore --uri="$MONGODB_URI" --archive=/var/backups/humsols/humsols-<stamp>.archive.gz --gzip --drop`.

Copy backups off the server regularly (for example with rsync to another machine).

## 9. Updating / redeploying

`scripts/deploy.sh` (in this repository) pulls, installs, builds and restarts:

```bash
sudo -u humsols /srv/humsols/app/scripts/deploy.sh && sudo systemctl restart humsols
```

The script stops before restarting if the build fails, so the running site keeps working.

## 10. Checks after go-live

- Submit the contact form. Confirm the email arrives at info@humsols.com and the auto-reply arrives at the address you used.
- Check **Admin › Dashboard** for "email delivery failed" warnings (wrong SMTP settings show up there).
- Confirm `https://humsols.com/sitemap.xml` and `/robots.txt` load.
- Run Lighthouse (mobile) on the home page.
