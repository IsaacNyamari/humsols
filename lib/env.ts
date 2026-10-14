// Server-side environment access. Never import this from a Client Component.

function int(value: string | undefined, fallback: number) {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const env = {
  get mongodbUri() {
    return process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/humsols";
  },
  get siteUrl() {
    return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  },
  get mailDriver(): "smtp" | "log" {
    if (process.env.MAIL_DRIVER === "smtp") return "smtp";
    if (process.env.MAIL_DRIVER === "log") return "log";
    return process.env.NODE_ENV === "production" ? "smtp" : "log";
  },
  get smtp() {
    return {
      host: process.env.SMTP_HOST ?? "mail.humsols.com",
      port: int(process.env.SMTP_PORT, 465),
      secure: (process.env.SMTP_SECURE ?? "true") === "true",
      user: process.env.SMTP_USER ?? "",
      password: process.env.SMTP_PASSWORD ?? "",
    };
  },
  get mailFrom() {
    return process.env.MAIL_FROM ?? "Human Solutions <info@humsols.com>";
  },
  get leadNotifyTo() {
    return (process.env.LEAD_NOTIFY_TO ?? "info@humsols.com")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  },
  get uploadDir() {
    return process.env.UPLOAD_DIR ?? "./uploads";
  },
  get maxUploadBytes() {
    return int(process.env.MAX_UPLOAD_MB, 10) * 1024 * 1024;
  },
  get rateLimit() {
    return {
      max: int(process.env.RATE_LIMIT_MAX, 5),
      windowMs: int(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) * 60 * 1000,
    };
  },
};
